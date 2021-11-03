---
title: "Rust - strが引数/戻り値で使えない理由について"
emoji: "🦀"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["rust"]
published: true
---

# 背景
[Rustの公式ドキュメント 4.3スライス型](https://doc.rust-jp.rs/book-ja/ch04-03-slices.html)にて、以下のようなシグニチャを持つ関数を定義するサンプルコードがある。

```rust
// 文字列を受け取って、その文字列中の最初の単語を返す関数
fn first_word(s: &String) -> &str
```

この時、戻り値の型として定義されているのは、 `str` ではなく、 `str` への参照である `&str` だ。 `usize` を返す場合は `&usize` を使うのではなく、単に `usize` をそのまま返すものとして定義されているし、実際そう実装できる。

では、 `str` を直接返すようにするとどうなるかというと、以下のようなメッセージを出しながらコンパイルエラーとなる。

```
error[E0277]: the size for values of type `str` cannot be known at compilation time
  --> src/main.rs:32:24
   |
32 | fn test(s: &String) -> str {
   |                        ^^^ doesn't have a size known at compile-time
   |
   = help: the trait `Sized` is not implemented for `str`
   = note: the return type of a function must have a statically known size
```

試しに引数を `str` にした場合も、同様のエラーとなる。

[^1]: 戻り値 https://doc.rust-jp.rs/rust-by-example-ja/scope/lifetime/static_lifetime.html

```
error[E0277]: the size for values of type `str` cannot be known at compilation time
  --> src/main.rs:32:9
   |
32 | fn test(s: str) -> String {
   |         ^ doesn't have a size known at compile-time
   |
   = help: the trait `Sized` is not implemented for `str`
   = help: unsized locals are gated as an unstable feature
help: function arguments must have a statically known size, borrowed types always have a known size
```

# 疑問点
なぜ、 `str` はそのまま関数の引数および戻り値として使えないのか？
`&str` を使えば引数と戻り値どちらにも利用できるし、実際他のサンプルでも基本的に `&str` を使っているようだが、ではこの `&str` は何を指す参照なのか？

"the size for values of type `str` cannot be known at compilation time" というエラーメッセージが共通で出ているが、ここで言う "size" とは何で、それがコンパイル時とどう関わっているのか？

# 結論
関数の引数および戻り値はスタックで管理されるが、スタックの性質上、スタック上には固定長のデータしか乗せることができない。
一方、 `str` は任意長のデータなので、それをそのまま関数の引数と戻り値に使うことはできない。

`str` の代わりに、 `str` への参照 `&str` を使えば固定長のデータとなるので、関数の引数および戻り値として使用できる。

エラーメッセージで "cannot be known at compilation time" と出ているのは、上記のようなメモリ管理上の問題をRustが事前に検知しているからである。

# 調査
まずはエラーメッセージ中の "the size for values of type `str` cannot be known at compilation time" で検索してみたところ、stackoverflowで以下の質問と、その回答が見つかった。

----
https://stackoverflow.com/questions/49393462/what-does-str-does-not-have-a-constant-size-known-at-compile-time-mean-and

> What it means is harder to explain succinctly. Rust has a number of types that are unsized. The most prevalent ones are str and [T]. Contrast these types to how you normally see them used: &str or &[T]. You might even see them as Box<str> or Arc<[T]>. The commonality is that they are always used behind a reference of some kind.
> Because these types don't have a size, they cannot be stored in a variable on the stack — the compiler wouldn't know how much stack space to reserve for them! That's the essence of the error message.
----
https://ja.stackoverflow.com/questions/65708/rust%E3%81%AEresult%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E3%81%AE%E8%B3%AA%E5%95%8F-errore0277-the-size-for-values-of-type-str-cannot-be-kno

> まずはエラーメッセージそのもの、「the size for values of type str cannot be known at compilation time」について
> str を &'static str にすれば解決します。 Rustでは勝手にポインタが作られたりしないので str は任意長の文字列そのものを表わします。これを関数から返すということは、例えば1000文字の文字列ならば1000文字分のデータをコピーして呼出元に返すことになります。今のところRustは任意長のデータをスタックにコピーする操作は許していません。そこで &str とポインタを介すると16バイト（ポインタサイズ8バイト+strのサイズ8バイト）と定サイズになるのでエラーにならなくなります。
> 「str 型を生で使うことはない」と覚えてしまっていいでしょう。
---

これらの回答を見る限り、ポイントは以下の二点のようである。

1. `str` は任意長で、特定のサイズを持たないデータ型である[^1]
2. 任意長のデータ型を格納する変数を、スタックに乗せることはできない[^2]

[^1]: https://doc.rust-jp.rs/book-ja/ch08-02-strings.html `"Rustには、言語の核として1種類しか文字列型が存在しません。 文字列スライスのstrで、通常借用された形態&strで見かけます"`
[^2]: https://doc.rust-jp.rs/book-ja/ch04-01-what-is-ownership.html `"スタックを高速にする特性は他にもあり、それはスタック上のデータは全て既知の固定サイズでなければならないということです"`

これらの情報が手に入れば、以下のように説明が付きそうだ。

第一に、 `str` は任意帳の文字列そのものを表す。すなわち、以下の構造で表されるような「文字のリスト」としての文字列そのものである。

```
[0] -> 'H'
[1] -> 'e'
[2] -> 'l'
[3] -> 'l'
[4] -> 'o'
```

関数の引数として渡された値はスタックへ乗せられる[^3]。この時、既述の通り[^1]、スタックへ載せられるデータは全て固定長、すなわち既知の固定サイズでなくてはならない。
一方、`str` は任意長のデータ型であり固定長ではないため、 `str` はスタックへは乗せられず(代わりに、ヒープに乗せなくてはならない)、そのため、 `str` を関数が引数として受け取るデータ型に使うことはできない。Rustはこうしたメモリ上の問題を事前に検出して、コンパイルエラーとしている。

関数の戻り値もやはりスタックへ乗せられる[^4]。そのため、引数の時と同じ理由から、戻り値もやはり既知の固定サイズでなくてはならない。そのため、任意長のデータ型である `str` 戻り値の型としても利用できず、コンパイルエラーとなる。

[^3]: https://doc.rust-jp.rs/book-ja/ch04-01-what-is-ownership.html `"コードが関数を呼び出すと、関数に渡された値(ヒープのデータへのポインタも含まれる可能性あり)と、 関数のローカル変数がスタックに載ります。関数の実行が終了すると、それらの値はスタックから取り除かれます"`
[^4]: https://brain.cc.kogakuin.ac.jp/~kanamaru/lecture/MP/final/part06/node9.html `"square 関数が終了するとスタック領域は図 7(c) のようになり、 戻り値 $v0 の値が変数 b に代入されてプログラムが終了する。"`

以上のことから、 `str` を関数の引数および戻り値として扱うことはできない。しかし実際には、文字列を、より正確には文字列スライスを引数や戻り値に用いたいケースはあるし、実際、冒頭のRustドキュメントで提示されているのはそうした例である。

そこで、 `str` ではなくその参照である `&str` を用いることで、文字列(スライス)を引数および戻り値に利用できる。というのも、ポインタ型データのサイズは「ポインタのサイズ + ポインタが指すデータ型のサイズ」として事前に決定できるから、すなわち固定長だからである[^5]。
ポインタ型は固定長のデータであるからスタックにも乗せることができ、そのため、関数の引数および戻り値としても利用可能となる。事実、 `str` に限らないオブジェクト(`String`など)も同様に、オブジェクトそのものは非固定のデータ型であっても、 `&String` のように参照を経由することで関数の引数や文字列として利用できている。

[^5]: https://ja.stackoverflow.com/questions/65708/rustのresultについての質問-errore0277-the-size-for-values-of-type-str-cannot-be-kno `"そこで &str とポインタを介すると16バイト（ポインタサイズ8バイト+strのサイズ8バイト）と定サイズになるのでエラーにならなくなります。"`

# 記事として整理する前のスクラップ
https://zenn.dev/philomagi/scraps/0adf7ed2117368
