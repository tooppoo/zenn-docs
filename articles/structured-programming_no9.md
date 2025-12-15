---
title: '構造化プログラミング論 第9章 - プログラム例の翻訳'
emoji: "✏️"
type: "tech"
topics: ["構造化プログラミング"]
published: false
---

## 出典
<!-- textlint-disable ja-no-mixed-period -->
E.W.ダイクストラ, C.A.R.ホーア, O.J.ダール 共著(1975)『構造化プログラミング』(サイエンス社) 野下浩平, 河合慧, 武市正人 共訳

https://www.amazon.co.jp/dp/4781902766

上記より
E.W.ダイクストラ著『構造化プログラミング論』
第9章「プログラムの段階的作成（例１）」(p.30-44)
<!-- textlint-enable ja-no-mixed-period -->

## 狙い

- 本文中の疑似言語で記述されたプログラムを、実際に動作するプログラム（今回はTypeScriptを使用）で書き直すことで、自身の理解を助ける
- 本文中のプログラム例を引用しつつ、ダイクストラによる「構造化」例を共有することで、「構造化プログラミング」理解の一助となるテキストを作成する

## 課題

> 2を最初の素数として、はじめの1000個の素数の表を計算機に印刷させること[^1]

[^1]: ダイクストラ(1975) p.30

## 解法

以下、『構造化プログラミング論』の記述に従って、課題を解決するまでの手順を記述していく。ただし、本文で疑似言語を使って記述されているプログラム例は、以下ではすべてTypeScriptで置き換えていく。TypeScriptによるコードは、筆者による翻案であり、ダイクストラのものそのままではない。

---

ダイクストラによる基本的なプログラム作成パターンは以下[^2]。

- 数段にわけてプログラムを作成する
- 各段階で決定することを、できるだけ少なくする

[^2]: ダイクストラ(1975) p.31

この時点で最も簡単なプログラムは、以下のようになる。

```ts
printOutFirst1000PrimeNumbers(); // 記述0
```

`printOutFirst1000PrimeNumbers()` に対応する命令があれば、プログラム実装はこれで終了となる。実際にはそんな命令は存在しないので、「もっと基本的な」作用で構成されているプログラムを考える必要がある。
最初の案として、「素数の生成」と「印刷」を分離する[^3]。

```ts
function printOutFirst1000PrimeNumbers() {
  // 記述1
  let p: 表p
  setFirst1000PrimeNumbers(p);
  printTable(p);
}

printOutFirst1000Primenumbers();
```

この時点では「素数」という概念の性質も、印刷結果の割り付け方も一切プログラムには関わっていない（＝決定していない）。「これは、"分割統治"という大原則を適用する試みが、多少とも成功してきていることを暗示」している[^4]。

[^3]: ダイクストラ(1975) p.31
[^4]: ダイクストラ(1975) p.32

ここでダイクストラは「表p」の構造を決定する必要があるとし、「いつ表pの構造を決定するか」「表pの構造をどのような内容にするか」について、それぞれ2案挙げているが、ここでは割愛する。
最終的に、ダイクストラは「表p」の構造として「k <= 1000に対して、k番目の素数は何か」の質問へ答えるのに適した方法を選択する、すなわち `1<=k<=1000 に対して、p[k]がk番目の素数`となるような構造を選択している。[^5]

[^5]: ダイクストラ(1975) p.32-34

<!-- textlint-disable no-mix-dearu-desumasu -->
元のテキスト(`integer array p[1:1000]`)と1:1対応できるよう、単純な配列ではなく以下のようなデータ構造を用意することにする。これはダイクストラの記述ではなく、TypeScript化するにあたっての筆者による翻案である。配列の上限が定められていることについて、C言語など配列のサイズをあらかじめ決定しておく必要のある言語が前提とされていると解釈した。
<!-- textlint-enable no-mix-dearu-desumasu -->

```ts
class IntegerArray {
  private array: number[]
  constructor(private min: number, max: number) {
  }

  getItem(i: number): number {
    if (i < this.min || 1000 < this.max) throw new Error('OutOfRange')

    // 初期値については本文でも特に言及が無い
    // おそらく0や-1など、小さな数で初期化されていることが前提されている？
    return this.array[i - 1] ?? 0
  }
  setItem(i: number, value: number): void {
    if (i < this.min || 1000 < this.max) throw new Error('OutOfRange')

    this.array[i - 1] = value
  }
}
```

以降では、このように動く `IntegerArray` が言語組み込みで存在するかのように扱う。
この時、記述1は以下のようになる。

```ts
function printOutFirst1000PrimeNumbers() {
  // 記述1
  let p: IntegerArray = new IntegerArray(1, 1000)
  setFirst1000PrimeNumbers(p);
  printTable(p);
}

printOutFirst1000Primenumbers();
```

「記述1」は、「記述0のつぎの洗練」という意味で「1」と呼ぶことにする[^6]。さらに記述1の構成要素を、次のように分解・ラベリングする。

| 記述1 | ラベル |
| --- | --- |
| 「表p」  | 1a |
| 「表pにはじめの1000個の素数を入れる」  | 1b |
| 「表pを印刷する」  | 1c |

[^6]: ダイクストラ(1975) p.34

ここで、「表p」について前節で設定した定義を記述1a～cそれぞれに適用して、記述2を作成する[^7]。

| 記述1のラベル | 記述2 | 記述2のラベル |
| --- | --- | --- |
| 1a | integer array p[1:1000] | 2a |
| 1b | 1から1000までのkに対して、p[k] をk番目の素数にする | 2b |
| 1c | 1から1000までのｋに対して、p[k]を印刷する | 2c |

[^7]: ダイクストラ(1975) p.35

ここから、2bと2cをさらにそれぞれ独立して「洗練」させていく[^8]。

[^8]: 『構造化プログラミング論』では、詳細化の部分は一貫して「洗練」という表現が用いられている

まずは2bについて。最も明らかなパターンは以下 2b1(1) である（`()`の中は、版の番号）。

```ts
// 2b1(1)
function setFirst1000PrimeNumbers(p: IntegerArray): void {
  p.setItem(1, 2)
  p.setItem(2, 3)
  p.setItem(3, 5)
  p.setItem(4, 7)
  p.setItem(5, 11)
  // 以下1000個まで続く
};
```

ただしこの場合、プログラマはコンピュータによる計算を必要としない（少なくとも1000個までの素数を、全てあらかじめ知っている）ことになるので、これ以上は追いかけない[^9]。

[^9]: ダイクストラ(1975) p.36

<!-- textlint-disable no-mix-dearu-desumasu -->
プログラマが1000番目の素数を知らない場合、pを埋めるのに「最も自然な順序は、添数が大きくなる順である」。それを表現すれば、以下の記述2b1(2)となる[^10]。
<!-- textlint-enable no-mix-dearu-desumasu -->

[^10]: ダイクストラ(1975) p.36

```ts
// 2b1(2)
function setFirst1000PrimeNumbers(p: IntegerArray): void {
    let k = 0;
    let j = 1;

    while (k < 1000) {
      j = addIndexToNextPrimeNumber(j);
      k = k + 1;
      p.setItem(k, j)
    }
}
```

続いて、 `addIndexToNextPrimeNumber` の記述（=2b1(2)a）を「洗練」させて以下のプログラムを得る[^11]。

```ts
// 2b1(2)a
function addIndexToNextPrimeNumber(j: number): number {
  let jprime: boolean = false;
  do {
    j = j + 1;
    jprime = indexIsPrime(j);
  } while (!jprime)

  return j;
}
```

[^11]: ダイクストラ(1975)p.36-37

ところで、2以降の素数は全て奇数であるということはわかっているから、2b1(2)および2b1(2)aは、性能面で不満がある。よって、素数2を特別扱いとし、ループ部分は奇数の素数のみを扱うようにする。これによって2b1(3)および2b1(3)aを得る[^12]。

[^12]: ダイクストラ(1975)p.37

```ts
// 2b1(3)
function setFirst1000PrimeNumbers(p: IntegerArray): void {
    let k = 1;
    let j = 1;
    p.setItem(1, 2)

    while (k < 1000) {
      j = addIndexToNextOddPrimeNumber(j);
      k = k + 1;
      p.setItem(k, j)
    }
}

// 2b1(3)a
function addIndexToNextOddPrimeNumber(j: number): number {
  let jprime: boolean = false;
  do {
    j = j + 2;
    jprime = indexIsPrime(j);
  } while (!jprime)

  return j;
}
```

続いて2b1(3)aを「洗練」することで、2b2(3)が得られる。2b1(3)aを「洗練」するために「素因数だけを試せばよい」という代数の知識、および「試す素数は、既にpに計算されている」という事実を用いる。利用する事実は、以下である[^13]。

1. ｊは奇数であるので、素因数になりうる最小のものは `p.getItem(2)` である。また、それは2より大きい最小の素数である
2. `p.getItem(ord)` は、その2乗がjを超える最小の素数とするとき、試す最大の素数は、 `p.getItem(ord - 1)` である[^14]

[^13]: ダイクストラ(1975)p.37-39
<!-- textlint-disable no-mix-dearu-desumasu -->
[^14]:  ダイクストラ(1975)p.39 Donald Knuthの批評より<br>> ここであなたは、重大な落ち(原文ママ)をおかしています。あなたのプログラムは、整数論の深い結果を使っているのです。すなわち、 `p[n]` がn番目の素数を表すとすると、 `p[n+1] < p[n]^2` がつねに成り立つことです。
<!-- textlint-enable no-mix-dearu-desumasu -->

これらより、2b3(3)aを以下の記述で表す[^15]。

```ts
function addIndexToNextOddPrimeNumber(j: number, p: IntegerArray): number {
  let ord: number = 1;
  while (p.getItem(ord) ^ 2 <= j) {
    ord = ord + 1
  }

  let n: number = 2;
  let jprime: boolean = true;
  while (n < ord && jprime) {
    jprime = pnIsNotFactorOf(j);
    n = n + 1
  }

  return j;
}
```

[^15]: ダイクストラ(1975)p.39

ここで、ordを毎回計算し直す代わりに、jの値に対して定義され、かつ現在の値を保持する変数ordを導入する。
そのために、記述2b1から改めて再プログラミングを行う。
以下は、改めて作成されるプログラム記述2b1(4)である[^16]。

```ts
// 2b1(4)
function setFirst1000PrimeNumbers(p: IntegerArray): void {
    let k = 1;
    p.setItem(1, 2)
    let { j } = setJTo1(); // 2b1(4)b

    while (k < 1000) {
      j = addJAndMakeNextOddPrimeNumber(j); // 2b1(4)a
      k = k + 1;
      p.setItem(k, j)
    }
}

```

[^15]: ダイクストラ(1975)p.39-40

ここで、以下の記述を用いた。

- 2b1(4)a : 奇数jを増やしてつぎの奇数の素数にする
- 2b1(4)b : jを1にする

次のレベルでは、2b1(4)aに対する部分計算を導入する。「その他は、そのまま」である[^16]。

[^16]: ダイクストラ(1975)p.40-41 ここでの「その他は、そのまま」は、「2b1(4)aは洗練してから2b2(4)の記述に用いる」「2b1(4)bは洗練無しに2b2(4)bとして、次のレベルの記述でもそのまま同じ記述を用いる」という意味と解釈した。

```ts
//2b2(4):

// 2b1(4)a
function addJAndMakeNextOddPrimeNumber(j: number) {
  let jprime: boolean;
  do {
    { j } = jPlus2(j); //2b2(4)c
    jprime = isPrimeNumber(j) //2b2(4)d
  } while(!jprime)

  return j;
}

// 2b1(4)b = 2b2(4)b = setJTo1
```

2b2(4)b~d は、2b3(4)a~cを定めつつ以下のようにかける[^17]。

```ts
// 2b2(4)b
function setJTo1() {
  return {
    j: 1,
    ord: initializeOrd(), // 2b3(4)a
  }
}

// 2b2(4)c
function jPlus2({ j, ord }: { j: number, ord: number }) {
  return {
    j: j + 2,
    ord: adjustOrd({ j, ord }), // 2b3(4)b
  }
}

// 2b2(4)d
function isPrimeNumber(p: IntegerArray, n: number, { j, ord }: { j: number, ord: number }) {
  let n = 2;
  let jprime = true;
  while (n < ord && jprime) {
    jprime = isNotFunctor(p, n, j) // 2b3(4)c
    n = n + 1
  }
  return jprime;
}
```

[^17]: ダイクストラ(1975)p.41

次のレベルでは、以下2つの独立した「洗練」を行う。

1. ordは、jの非減少関数で、jの値は増加する一方であるので、ordの調整は、条件つきの増加
2. `p.getItem(n)`がjの因数であるかどうかは、剰余が0であるかどうかで決める

これらより、つぎが得られる[^18]。

[^17]: ダイクストラ(1975)p.41-42

```ts
// 2b4(4):

// 2b3(4)a = 2b4(4)a = initializeOrd

// 2b3(4)b
function adjustOrd({ j, ord }: { j: number, ord: number }) {
  if (isOrdTooSmall({ j, ord })) { // 2b4(4)b
    return ordPlus1({ j, ord }) // 2b4(4)c
  }
  else {
    return { j, ord }
  }
}

// 2b3(4)c
function isNotFunctor(p: IntergerArray, n: number, j: number): number {
  const r = mod(p.getItem(n), j) // 2b4(4)d
  return r !== 0
}
```

- 2b4(4)a: initializeOrd
- 2b4(4)b: isOrdTooSmall
- 2b4(4)c: ordPlus1
- 2b4(4)d: mod

2b4(4)dに対応する命令があればそれを使えば良い[^18]が、『構造化プログラミング論』では、一旦それも存在しないと仮定する。
この時、jの値が `p.getItem(n)` の倍数になっているかどうかを調べるために、2つめのIntegerArrayを導入する。
2つめのIntegerArrayの要素には、jの近くの相続く素数の倍数を入れる。
配列の大きさを決めるのに、ordの値の上限を知りたい。整数論の結果からみて、30が安全な上限となる。

[^18]: TS/JSの場合は `%` 演算子を使えば良い

```ts
const mult = new IntegerArray(1, 30)
```

<!-- textlint-disable ja-no-mixed-period, no-mix-dearu-desumasu -->
さらに `n < ord` に対して、 `mult.getItem(n)` は、 `p.getItem(n)` の倍数であり、かつ

```ts
mult.getItem(n) < j + p.getItem(n)
```

をみたすものとする。これはｊを増加させても成り立つものである。 `p.getItem(n)` がjの因数であるかどうかを調べたい場合は、

```ts
mult.getItem(n) < j
```

である限り、 `mult.getItem(n)` を `p.getItem(n)` ずつ増やす。この増加のあとでは、 `mult.getItem(n) == j` が、 jが `p.getItem(n)`の倍数であるための必要十分条件になっている[^19]。
<!-- textlint-enable ja-no-mixed-period, no-mix-dearu-desumasu -->

[^19]: ダイクストラ(1975)p.43-44

許しうる `ord` の最大値ということから、 `isOrdSmall` を判定するのは以下式による。

```ts
p.getItem(ord) ^ 2 <= j
```

ただし、 `p.getItem(ord) ^ 2` の値を持つ変数squareを導入することによって、比較の回数を減らせると考える[^20]。

[^20]: ダイクストラ(1975)p.44

以上より、最終レベル 2b5(4) に到達する。

```ts
// 2b5(4)
let square: number;
let mult: IntegerArray = new IntegerArray(1, 30);

// 2b4(4)a
function initializeOrd() {
  return { ord: 1, square: 4 };
}
// 2b4(4)b
function isOrdToSmall({ square, j }: { square: number, j: number }) {
  return square <= j;
}
// 2b4(4)c
function ordPlus1({ square, ord, p }: { p: IntegerArray, square: number, ord: number }) {
  return {
    ord: ord + 1,
    squarre: p.getItem(ord) ^ 2,
  }
}
// 2b4(4)d
function mod(mult: IntegerArray, p: integerArray, n: number, j: number) {
  while (mult.getItem(n) < j) {
    mult.setItem(n, mult.getItem(n) + p.getItem(n));
  }
  return j - mult.getItem(n)
}
```

---

あとからの「洗練」によって追加された変数など、各所の辻褄を合わせて結合すると、全体としては以下のようになる。

```ts
class IntegerArray {
  private array: number[] = []
  constructor(private min: number, private max: number) {
  }

  getItem(i: number): number {
    if (i < this.min || 1000 < this.max) throw new Error('OutOfRange')

    // 初期値については本文でも特に言及が無い
    // おそらく0や-1など、小さな数で初期化されていることが前提されている？
    return this.array[i - 1] ?? 0
  }
  setItem(i: number, value: number): void {
    if (i < this.min || 1000 < this.max) throw new Error('OutOfRange')

    this.array[i - 1] = value
  }

  toArray(): number[] {
    return [...this.array]
  }
}

const mult = new IntegerArray(1, 30)

function printOutFirst1000PrimeNumbers() {
  // 記述1
  let p = new IntegerArray(1, 1000)
  setFirst1000PrimeNumbers(p);
  printTable(p);
}

function printTable(p: IntegerArray) {
  // 本文では、印刷の処理に関する言及は無し。
  // とりあえず標準出力するだけ。
  console.log(p.toArray());
}

type JValueSet = { j: number, ord: number, square: number }
function setFirst1000PrimeNumbers(p: IntegerArray): void {
  let k = 1;
  p.setItem(1, 2)
  let { j, ord, square } = setJTo1();

  while (k < 1000) {
    j = addJAndMakeNextOddPrimeNumber(p, { j, ord, square });
    k = k + 1;
    p.setItem(k, j)
  }
}

function addJAndMakeNextOddPrimeNumber(p: IntegerArray, { j, ord, square }: JValueSet) {
  let jprime: boolean;
  let j2: JValueSet
  do {
    j2 = jPlus2(p, { j, ord, square });
    jprime = isPrimeNumber(p, j2);
  } while(!jprime)

  return j2.j;
}

function setJTo1() {
  const { ord, square } = initializeOrd();
  return {
    j: 1,
    ord,
    square,
  }
}
function jPlus2(p: IntegerArray, { j, ord, square }: JValueSet) {
  const adjusted = adjustOrd(p, { j, ord, square });
  return {
    j: j + 2,
    ord: adjusted.ord,
    square: adjusted.square,
  }
}
function isPrimeNumber(p: IntegerArray, { j, ord, square }: JValueSet) {
  let n = 2;
  let jprime = true;
  while (n < ord && jprime) {
    jprime = isNotFunctor(p, n, j)
    n = n + 1
  }
  return jprime;
}
function adjustOrd(p: IntegerArray, { j, ord, square }: JValueSet) {
  if (isOrdTooSmall({ j, ord, square })) {
    return ordPlus1(p, { j, ord, square });
  }
  else {
    return { j, ord, square };
  }
}
function isNotFunctor(p: IntegerArray, n: number, j: number): boolean {
  const r = mod(p, n, j)
  return r !== 0
}

function initializeOrd() {
  return { ord: 1, square: 4 };
}
function isOrdTooSmall({ square, j }: JValueSet) {
  return square <= j;
}
function ordPlus1(p: IntegerArray, { j, ord }: JValueSet) {
  return {
    j,
    ord: ord + 1,
    square: p.getItem(ord) ^ 2,
  }
}
function mod(p: IntegerArray, n: number, j: number) {
  while (mult.getItem(n) < j) {
    mult.setItem(n, mult.getItem(n) + p.getItem(n));
  }
  return j - mult.getItem(n)
}

printOutFirst1000PrimeNumbers();
```

ここで定義している各種関数群は、可読性・汎用性などは無視して、できるかぎり本書で日本語にかかれている箇所の愚直な翻訳となるよう命名している。
この実装はあくまでサンプルであり、またサンプルのさらなる翻案である以上、本文との対応関係をできるだけ明確にすることが目的。

## 感想

サンプルコードの翻案には苦労させられたが、実際に紐解いてみれば、そこには「思いがけない解法」や「目を見張るような技巧」は何もなかったと言って良い。
最終的なプログラムはそこそこのサイズになり、処理効率改善のための技巧的なコードも入り込んではいるものの、各「洗練」で行われているのは一貫して「数段に分けてプログラムを作成すること」であり、「各段階で決定することをできるだけ少なくすること」でしかなかったと思う。
この2点は、しかし章の冒頭で宣言されたことであり[^21]、そんな単純なルールを丁寧に適用することで、実際にそれなりの複雑さのプログラムを作れるのだということを示されたのは、なかなかに感動ものだった。

[^21]: ダイクストラ(1975)p.31

ある意味で原始的・素朴とも言えつつ、むしろそれ故に周辺パラダイムや環境に揺るがされることなく適応可能と思わされるだけの力が、「構造化プログラミング」にはあると感じた一幕だった。
