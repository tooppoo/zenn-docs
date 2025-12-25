---
title: "今更学ぶ単一責任原則 - 定義の変遷とその使い分け"
emoji: "🤔"
type: "idea" # tech: 技術記事 / idea: アイデア
published: false
topics: ["単一責任原則"]
---

## はじめに

クラスは一つのことだけをすべき」――― 単一責任原則（Single Responsibility Principle、以下SRP）をこう理解している開発者は少なくない。しかし、この理解は原典の定義とは大きく異なる。

日本語コミュニティにおいて、「SRP」における「責任（Responsibility）」という言葉は、しばしば日常語の範疇で理解されてしまっている。

この混乱の原因はいくつかある。主には、英語で書かれた原典へのアクセス困難さと、原典あるいは原典への参照を明示した資料にあたらず、二次資料・三次資料を経由することで良しとしてしまう日本語コミュニティの風習にあるだろう。その結果として「SRP」の、とりわけ「責任（Responsibility）」の解釈が各自の想像に委ねられてしまい、「SRP」という同じ用語を用いているにもかかわらず、しばしば議論がかみ合わなくなってしまう。
場合によっては、日常語の延長線上とされてしまった「責任」を用いる「SRP」の説明を以て、「SRPは有名無実な原則だ」と批判されてしまう場合もある。これは、本来のSRPに対する適切な批判とは言い難いが、そのような批判を生み出してしまう土壌は現実にある。

例えば、SRPの「責任」について、以下のような独自の解釈が展開されている：

- 「ある関心事について、不正な動作にならないよう、正常に動作するよう制御する責任」[^1]
- 「再利用性を高めるための原則」として、一つのコンポーネントは一つの機能のみを持つべき[^2]

これらは、いずれも発案者Robert C. Martin（以下、Martin）の定義とは異なる軸での理解だ。

さらに複雑なことに、Martin自身がSRPの定義を変更している。『Agile Software Development, Principles, Patterns, and Practices』（2003年、以下ASD）、ブログ記事（2014年、以下Blog）、そして『Clean Architecture』（2017年、以下CA）では、定義が段階的に変化しているのだ。

本記事では、これら三つの資料を参照し、SRPの定義がどのように変化したのかを明らかにする。その上で、それぞれの定義の関係を批判的に分析し、実践での使い分けについて提案する。

[^1]: https://qiita.com/MinoDriven/items/76307b1b066467cbfd6a
[^2]: https://qiita.com/seya/items/8814e905693f00cdade2

## SRPの思想的ルーツ

SRPは突然現れた原則ではない。MartinはASDで既にその思想的背景を説明している。

> The principle was described in the work of Tom Demarco and Meilir Page-Jones. The called it cohesion. They defined cohesion as the functional relatedness of the elements of a module. In this chapter we'll shift that meaning a bit and relate cohesion to the forces that cause a module, or a class, to change[^3].
>
> この原則はトム・デマルコとメイリル・ページ＝ジョーンズの著作で説明された。彼らはこれを凝集度と呼んだ。彼らは、モジュールの要素間の機能的関連性として凝集度を定義した。本章ではその意味を少し変え、凝集度をモジュールやクラスに変化をもたらす力と関連づける。（以降、英文の翻訳は筆者による）

[^3]: Martin(2003) p.95

他、BlogでもMartinはその思想的背景に言及している。

> In 1972 David L. Parnas published a classic paper entitled On the Criteria To Be Used in Decomposing Systems into Modules.
> (...)
> Parnas’ conclusion was that modules should be separated based, at lease in part, on the way that they might change.
>
> Two years later, Edsger Dijkstra wrote another classic paper entitled On the role of scientific thought. in which he introduced the term: The Separation of Concerns.
>
> The 1970s and 1980s were a fertile time for principles of software architecture. Structured Programming and Design were all the rage. During that time the notions of Coupling and Cohesion were introduced by Larry Constantine, and amplified by Tom DeMarco, Meilir Page-Jones and many others.
>
>In the late 1990s I tried to consolidate these notions into a principle, which I called: The Single Responsibility Principle. (I have this vague feeling that I stole the name of this principle from Bertrand Meyer, but I have not been able to confirm that.)[^4]
>
> 1972年、デイビッド・L・パーナスは『システムをモジュールに分解する際に用いるべき基準について』と題する古典的論文を発表した。
> (...)
> パーナスの結論は、モジュールは少なくとも部分的には、それらがどのように変化する可能性があるかに基づいて分離されるべきだというものだった。
>
> 2年後、エドガー・ダイクストラは『科学的思考の役割について』と題する別の古典的論文を執筆し、その中で「関心の分離」という概念を導入した。
>
> 1970年代から1980年代にかけては、ソフトウェアアーキテクチャの原則が活発に発展した時代であった。構造化プログラミング・設計が流行していた。この時期に結合度と凝集度の概念がラリー・コンスタンティンによって提唱され、トム・デマルコ、メイリル・ページ＝ジョーンズらによってさらに発展が図られた。
>
> 1990年代後半、私はこれらの概念をひとつの原則に統合しようと試みた。私はこれを単一責任の原則と呼んだ（この原則の名称をバートランド・マイヤーから拝借したような漠然とした記憶があるが、確認はできていない）。

[^4]: Martin(2014)

このように、SRPはパーナスに端を発し、ダイクストラ、デマルコ、コンスタンティン、ジョーンズらによって洗練されてきたモジュール分割の理論を統合したものである。

## SRP v1：「変更の理由」による定義（ASD, 2003）

### 定義

ASDにおけるSRPの定義は以下の通りだ：

> A class should have only one reason to change[^3].
>
> クラスは変更される理由を一つだけ持つべきである。

Martinはさらに、「責任」を次のように定義する：

> In the context of the SRP, we define a responsibility to be "a reason for change." If you can think of more than one motive for changing a class, then that class has more then one responsibility.[^5]
>
> SRPの文脈では、責任を「変更の理由」と定義する。あるクラスを変更する動機が複数思い浮かぶ場合、そのクラスは複数の責任を負っている。

[^5]: Martin(2003) p.97

### 問題の焦点と目的

v1の主目的は、**不要な依存関係と変更の波及を排除すること**だ。

ASDにおいてMartinは、大きく分けて「技術的効率の損失」と「設計の脆弱性」の2点を問題点として挙げている。

それらを説明するにあたり、Martinは以下のような`Rectangle`クラスを挙げている。これは、SRP違反の例である。[^6]

[^6]: Martin(2003) p.96

![ComputationalGeometryApplication, Rectanble, GraphicalApplication, GUIモジュールが図に含まれている. Rectangleはdraw():voidとarea():double という2つのpublicメソッドを持つ. CopuationalGeometoryApplicationからRectangleへ依存の矢印が引かれている. GraphicalApplicationからRectangleとGUIへ依存の矢印が引かれている. RectangleからGUIへ依存の矢印が引かれている. 図のタイトルは「More than one responsibility」である.](/images/asd_rectangle_before.png)

#### 問題：技術的効率の損失

- 不要なライブラリのリンク（コンパイル時間・リンク時間・メモリの浪費）
- 無関係な変更による再コンパイル・再テスト・再デプロイ

Martinは`Rectangle`クラスの例を挙げる。このクラスには、幾何学的計算（面積計算）と画面描画の二つのメソッドがある。

計算幾何学アプリケーションは`Rectangle`を数学的処理に使うが、画面描画はしない。しかし、この設計では以下の問題が発生する。

> This violation of the SRP causes several nasty problems. First, we must include the GUI in the computational geometry application. If this were a C++ application, the GUI would have to be linked in, consuming link time, compile time, and memory footprint. In a Java application, the .class files for the GUI have to be deployed to the target platform[^6].
>
> このSRP違反は複数の厄介な問題を引き起こる。第一に、計算幾何学アプリケーションにGUIを含める必要がある。C++アプリケーションの場合、GUIをリンクする必要があり、リンク時間・コンパイル時間・メモリ使用量を消費する。Javaアプリケーションでは、GUIの.classファイルをターゲットプラットフォームにデプロイしなければならない。

問題の本質は、「GUI技術の変更」という変更理由と、「幾何学的計算方式の変更」という変更理由が、一つのクラスに混在していることだ。

#### 問題：設計の脆弱性

- 責任の結合による予期せぬ副作用
- 一つの変更が他の責任を損なう可能性

Martinは、別チャプターで作成したボウリングゲームのアプリケーションで行った分割を例として、複数の責任の結合がもたらす本質的な問題を以下のように説明する。

> なぜこれら二つの責任を別々のクラスに分離することが重要だったのか？それぞれの責任が変更の軸となるからだ。(...)

> Why was it important to separate these two responsibilities into separate classes? Because each responsibility is an axis of change. When the requirements change, that change will be manifest through a change in responsibility amongst the classes. If a class assumes more than one responsibility, then there will be more than one reason for it to change.
> If a class has more than one responsibility, then the responsibilities become coupled. Changes to one responsibility may impair or inhibit the ability of the class to meet the others. This kind of coupling leads to fragile desings that break in unexpected ways when changed.[^6]
> 
> なぜこれら二つの責任を別々のクラスに分離することが重要だったのか？それぞれの責任が変更の軸となるからだ。要件が変更されると、その変更はクラス間の責任の変遷を通じて顕在化する。クラスが複数の責任を担う場合、変更の理由も複数存在する。
> クラスが複数の責任を持つと、それらの責任は結合される。一つの責任への変更が、他の責任を果たすクラスの能力を損なったり妨げたりする可能性がある。この種の結合は、変更時に予期せぬ形で壊れる脆弱な設計につながる。

Rectangleの例で言えば、GUIの変更が`Rectangle`クラスに変更を要求した場合、その変更が幾何学的計算に予期せぬ影響を与える可能性がある。

> Second, if a change to the `GraphicalAplication` causes the `Rectangle` to change for some reason, that change may force us to rebuild, retest, and redeploy the `ComputationalGeometryApplication`. If we forget to do this, that application may break in unpredictable ways.[^6]
>
> 第二に、`GraphicalApplication`の変更が何らかの理由で`Rectangle`に対する変更をもたらした場合、その変更により`ComputationalGeometryApplication`の再構築・再テスト・再デプロイが必要になる可能性がある。これを怠ると、アプリケーションが予測不能な形で動作しなくなる恐れがある。

Martinが「予測不能な形で動作しなくなる（behave unpredictably）」と述べているのは、単にテストやコンパイルの手間に閉じる問題ではない。一つの変更が、本来無関係であるべき別のモジュールに対して、開発者が予期しない形で影響を及ぼすことへの警告も含んでいる。

#### 目的：変更の影響範囲の限定

SRP v1の主目的は、**関係のない理由による変更から、クラスとそのクライアントを保護すること**だ。

それぞれのクラスで変更の理由が独立していれば、以下の効果が期待できる。

- 変更の影響範囲が限定される
- 不要な再コンパイル・再デプロイが避けられる
- 一つの責任への変更が、他の責任に予期せぬ影響を与えない

「バグ防止」や「変更容易性」は、この主目的の**帰結**として現れるものであり、主目的そのものではない。

### 適用の判断基準

重要なのは、Martinが「変更軸は、実際に変更が発生する場合にのみ変更軸となる」と述べていることだ。

`Modem`インターフェースの例で、Martinは接続管理（`dial`, `hangup`）とデータ通信（`send`, `recv`）の二つの責任を指摘する。
しかし、すぐに分離すべきかと問われれば、以下のように答えている。

> Should these two responsibilities be separated? That depends on how the application is changing[^5]. 
>
> これらの2つの責任は分離すべきでしょうか？それはアプリケーションがどのように変化するかによります。

この判断基準は重要だ。接続関数のシグネチャの変更が頻繁に発生し、その度にデータ通信を扱うクラスの再コンパイル・再デプロイが強いられるなら、分離すべき。しかし、そのような変更が発生しないなら、分離は「不必要な複雑性」を生むだけだ。

> An axis of change is an axis of change only if the changes actually occur. It is not wise to apply the SRP, or any other principle for that matter, if there is no symptom.[^5]
>
> 変更軸は、実際に変更が発生する場合にのみ変更軸となります。症状がないのにSRP（単一責任の原則）やその他の原則を適用するのは賢明ではありません。

ASDにおいて、SRPの「変更の理由」は実際に変更が発生してはじめて「変更の軸」となるのであって、その症状が発生していない内から適用するのは賢明でない（not wise）としている。

つまり、v1は**変更に発生した変更パターンに基づいて適用する**原則である。「あらかじめ適用しておく」という性質のものとしては、Martinにおいては捉えられていない。

## 転換点：「人々」への焦点（Blog, 2014）

### "This principle is about people"

2014年、Martinは自身のブログ「The Clean Code Blog」にて、SRPについて重要な記述を加えている

> And this gets to the crux of the Single Responsibility Principle. *This principle is about people*.[^4]"
>
> そしてこれが「単一責任原則」の核心になる。*この原則は、人々に関するものである*

この記事においておそらく初めて、MartinはSRPの「変更の理由」を、**人々**に明示的に結びつけた。

> When you write a software module, you want to make sure that when changes are requested, those changes can only originate from a single person, or rather, a single tightly coupled group of people representing a single narrowly defined business function.[^4]
>
> ソフトウェアモジュールを記述する際には、変更が要求された場合、その変更が単一の人物、あるいは単一の狭く定義された業務機能を代表する緊密に連携したグループからのみ発生することを明確にすべきだ。

2014年の時点で、SRPの焦点は技術的関心から**組織的関心**へと移行しつつあった。

### Employeeクラスの初出

この2014年のブログで、後にCA（2017）でも使われる`Employee`の例が登場する：

```java
public class Employee {
  public Money calculatePay();
  public void save();
  public String reportHours();
}
```

Martinは、CXOを題材に各メソッドを説明している。

- `calculatePay()`：CFOの組織が規定（財務責任）
- `reportHours()`：COOの組織が規定（運用責任）
- `save()`：CTOの組織が規定（技術責任）

つまり、現状の `Employee` クラスは、複数種類のCXO（が担う業務機能）に紐づく振る舞いを同時に保持しているということになる。すなわち、SRP違反の例だ。
この時点で「アクター（Actor）」という言葉は使われていないが、CXOというメタファによるクラス分割は、Blog(2014)時点で示唆されていた。

### SRPと凝集度・結合度

Martinはこの時点で、SRPを別の言葉でも表現している。

> Gather together the things that change for the same reasons. Separate those things that change for different reasons.
>
> 同じ理由で変化するものを集めよ。異なる理由で変化するものは分離せよ。

これは凝集度・結合度との関係を明示する表現だ。

ここで語られているのは、「何を集め、何を分離するか」ということについての指針である。すなわち、「分離」だけでなく「結合」もここでは重要な判断基準として示されている。
このことから、SRPを「一つのモジュールには一つの機能だけをもたせる」という原則として理解するのは、Martinの定義よりもやや狭い意味になっていると言える[^7]。

[^7]: これは憶測だが、UNIX哲学の「一つのことを上手くやる」との混同が生じているのかもしれない。

### 「変更の理由」は「人々」へ

> However, as you think about this principle, remember that the reasons for change are *people*. It is *people* who request changes.[^4]
>
> しかしながら、この原則について考えるときには、「変更の理由は*人々*である」ということを覚えておくこと。*人々*こそが変更を求めるのだ。

ブログでは、終盤でこのように強調している。v1ではやや抽象的に語られていた「変更の理由」が、「人々(people)」という表現によって、その方向性が定められつつある時期であると言えるだろう。

## SRP v2：「アクター」による定義（CA, 2017）

### 定義の明確化

CAにおいて、Martinは従来の表現が誤解を招いたことを認めた[^8]上で、新しい定義を提示している。

[^8]: Martin(2017) p.81 "SOLID原則のなかで最も誤解されがちなのが「単一責任の原則（SRP）」だろう。おそらくその原因は、名前があまりよくなかったことだ。"

> モジュールはたったひとつのアクターに対して責務を負うべきである。[^9]

[^9]: Martin(2017) p.82

ここで「アクター」とは、特定の一個人や一役職を指すものではなく、「変更を望む人たちをひとまとめにしたグループ」だ[^10]。2014年の「tightly coupled group of people representing a single narrowly defined business function」が、「アクター」という用語で整理された形だ。

[^10]: Martin(2017) p.82 "複数のユーザーやステークホルダーがシステムを同じように変更したいと考えることもある。ここでは、変更を望む人たちをひとまとめにしたグループとして扱いたい。このグループのことをアクターと呼ぶことにしよう。"

### 問題の焦点：組織的結合

v2が扱う問題は、**異なるアクターの要求による予期せぬ干渉**だ。

2014年のブログで初出した`Employee`の例が、ここで詳細に展開される。問題は、`calculatePay()`と`reportHours()`が両方とも`regularHours()`という共通メソッドを呼び出している場合だ。

CFOチームが所定労働時間の算出方法を変更したいとする。開発者が`regularHours()`を変更したが、それが`reportHours()`からも呼ばれていることに気づかなかった。結果：

> COO チームは激怒した。間違ったデータのせいで、何百万ドルもの損害が出たからだ。

### 目的：アクター間の干渉の回避

v2の主目的は、**異なるアクターの要求が互いに干渉しないようにすること**だ。

CAでは、技術的効率（コンパイル・デプロイ時間）への言及は**ほとんどない**。焦点は、組織構造とソフトウェア構造の対応関係に移っている。

### 適用レベルの変化

v1が主にクラス設計を扱うのに対し、v2は**モジュール・アーキテクチャレベル**を扱う。

Martinは「モジュール」を「ソースファイル」と定義しつつ、より一般的には「いくつかの関数とデータをまとめた凝集性のあるもの」としている。これは、パッケージやコンポーネントを含む、より大きな単位を想定している。

## 批判的分析

### v1とv2の関係—Martinの沈黙

#### Martinは関係を明示していない

CAでMartinは「最終的な単一責任の原則（SRP）は以下のようになる」と述べ、v2を提示している。
しかし、以下の重要な点が明示されていない：

1. **v2はv1を置き換えるのか、補完するのか**
   - 「最終的な」という表現はv1の無効化を示唆する
   - しかし明確な否定の言葉はない

2. **なぜ定義を変更したのか**
   - 「名前があまりよくなかった」は**誤解の原因**であって、**変更の理由**ではない
   - 原則名（Single Responsibility Principle）は変わっていない

3. **v1はどうなったのか**
   - ASDのRectangle、Modemの例は依然として有効なのか？
   - それらは「誤った例」だったのか、それとも別のレベルの原則なのか？

#### 複数の解釈が可能

この沈黙により、少なくとも以下の解釈が可能になる：

**解釈1：置き換え説**
- v2がv1を完全に置き換えた
- v1は不完全な定義だったので廃止された
- すべてのレベルでアクターを使うべき

**解釈2：補完説**
- v1とv2は異なるレベルで共存する
- v1は低レベル（クラス）、v2は高レベル（モジュール/アーキテクチャ）
- 状況に応じて使い分ける

**解釈3：拡張説**
- v2はv1の拡張である
- 「変更の理由」の中で組織的理由を明確化したのがv2
- v1の枠組み内でアクターを扱う

本記事では、解釈2（補完説）を**仮説**として検証する。
ただし、これはMartinの意図とは独立した筆者の解釈である。

### v2の限界—技術的関心の扱い

v2（アクター）は組織的/業務的関心を扱うには強力だが、技術的関心の扱いには限界がある。
以下、Martinのテキストを分析してこの主張を裏付ける。

#### CAは技術的関心をアクター化しようとしている

CAでは、`Employee`クラスの`save()`メソッドを「CTOアクター」に帰属させている：

> save() メソッドは、データベース管理者が規定する。報告先はCTO だ。[^9]

これは技術的関心（永続化）もv2の枠組みで扱おうとする試みだ。

しかし、この試みは不完全である

#### 証拠1：技術的分離の例でアクターが使われていない

Blog 2014で、Martinは技術的分離の重要性を述べている：

> This is the reason we do not put SQL in JSPs. This is the reason we do not generate HTML in the modules that compute results. This is the reason that business rules should not know the database schema. This is the reason we separate concerns.[^4]

注目すべきは、これらの分離を説明する際、**アクター概念を使っていない**点だ。
- 「SQLをJSPに入れない」は、どのアクター間の分離なのか？
- 「ビジネスルールがDBスキーマを知らない」は、誰と誰の責任分離なのか？

Martinは「we separate concerns」と述べ、むしろ古典的な**関心の分離**に言及している。

#### 証拠2：ASDでは技術的例が中心だった

ASDでのSRPの主要な例は、いずれも技術的分離だ：

- **Rectangle**（ASD p.96）：GUI描画 vs 幾何学的計算
- **Modem**（ASD p.97）：接続管理 vs データ通信

これらは「変更の理由」（v1）で説明されているが、その変更理由は：
- GUI技術の変更 vs 数学的アルゴリズムの変更
- 通信プロトコルの変更 vs データ処理の変更

いずれも**技術的変更**だ。そして、これらの例はCAではほぼ消えている。

#### 証拠3：DBAは「業務機能を代表する」のか？

Blog 2014でのアクターの定義を再確認しよう：

> a single tightly coupled group of people representing a single narrowly defined business function[^4]
>
> 単一の狭く定義された業務機能を代表する、緊密に連携した人々のグループ

DBAやCTOは、**業務機能**を代表するのか？

- CFOは財務という業務機能を代表する ✓
- COOは人事・運用という業務機能を代表する ✓
- CTOは...技術インフラを担当する

CTOは業務機能ではなく、**技術的決定**を担当する。
これはBlogでの定義と整合しない。

### 永続層とアプリケーション層の分離

この問題をより明確に示すため、具体例を考えよう。

**一般的な設計原則：** 永続層（データアクセス）とアプリケーション層（ビジネスロジック）を分離せよ。

v2でこれを説明しようとすると：
- 永続層は「CTOアクター」に属する？
- しかし、永続化は**すべてのアクター**（CFO、COO、顧客など）が必要とする横断的関心だ
- 「モジュールはたったひとつのアクターに対して責務を負うべき」という定義に合わない

v1なら自然に説明できる：
- 変更理由1：ビジネスロジックの変更（業務要件の変化）
- 変更理由2：DB技術の変更（PostgreSQL→MongoDB、ORM変更など）
- これらは独立した変更理由なので分離すべき

### アクターの同一性条件の循環性

もう一つの問題がある。v2の定義自体に**循環**がある。

CAでの定義（p.82）：
> 変更を望む人たちをひとまとめにしたグループ

この定義は以下の循環を含む：
- 何が「同じグループ」を構成するか？ → 「同じ変更を望む」人々
- 何が「同じ変更」か？ → 「同じアクターに属する」変更  
- 何が「同じアクター」か？ → 「同じ変更を望む人々のグループ」

実践では、この循環を**組織構造**（部門、役職）で解消するしかない。
しかし、組織構造では技術的関心（レイヤー分離、技術スタック）を自然に表現できない。

### 結論：v2は組織的関心に特化している

証拠を総合すると：

1. CAは技術的関心をアクター化しようとしている（`save()`→CTO）
2. しかし技術的分離の説明でアクターを使わず、「関心の分離」に言及している
3. ASD→CAで技術的例が組織的例に置き換わっている
4. アクターの定義（「業務機能を代表する」）は技術的関心に不適合
5. アクターの同一性条件が循環的で、組織構造に頼るしかない

**v2は組織的/業務的関心には有効だが、技術的関心の扱いには限界がある。**

これが、v1を併用する必要性の根拠である。

## 仮説：階層的適用の提案

### 仮説の定式化

前セクションの分析を踏まえ、本記事では以下の仮説を提示する：

**仮説：v1とv2は、異なるレベルで補完的に適用されるべきである**

具体的には：
- **モジュール・パッケージレベル**：v2（アクター）を適用し、組織構造を反映する
- **クラス・技術設計レベル**：v1（変更の理由）を適用し、技術的関心を分離する

### 仮説の根拠

この仮説は、以下の観察に基づく：

#### 根拠1：v2は技術的関心の扱いに限界がある

前セクションで示したように：
- v2は組織的関心（部門間の独立性）には強力
- しかし技術的関心（レイヤー分離、技術スタック）の説明には不適合
- Martinも技術的分離の説明でアクターを使っていない

#### 根拠2：v1とv2で扱う問題の性質が異なる

| 観点 | v1（変更の理由） | v2（アクター） |
|------|-----------------|---------------|
| 主な問題 | 技術的結合 | 組織的結合 |
| 主な例 | Rectangle、Modem | Employee |
| 適用レベル | クラス設計 | モジュール/アーキテクチャ |
| 判断基準 | 技術的変更パターン | 組織構造 |

この差異は、両者が**異なる種類の問題を扱っている**ことを示唆する。

#### 根拠3：概念の焦点の変化

v1とv2で、「責任」という言葉の焦点が変わっている。

**v1での責任：**
- 定義：「a reason for change」（変更の理由）
- 抽象的で、技術的変更も組織的変更も含む
- 例：「GUI技術の変更」「税法の変更」

**v2での責任：**
- 定義：「アクターに対する責務」
- Blog 2014で「responds to」（応答する）と言い換えられている
- 具体的で、組織的関係（人々との関係）に焦点

この焦点の変化が、適用レベルの違いをもたらす：
- v2は「人々」との関係なので、組織構造に適合
- v1は抽象的な「変更」なので、技術的変更にも適用可能

実践的には、以下の判断基準となる：
- 「この変更は誰（どのアクター）が要求するのか？」→ v2で考える
- 「この変更はなぜ（どんな技術的理由で）起こるのか？」→ v1で考える

### 仮説の検証可能性

この仮説は、以下の観点で検証可能である：

#### 仮説が支持される場合

- 階層的適用により、単一定義の適用よりも変更の影響範囲が限定される
- 組織変更と技術変更の両方に、適切に対応できる
- 設計判断の根拠が明確になる（「これは組織的関心だからv2」「これは技術的関心だからv1」）

#### 仮説が棄却される場合

- v2だけで技術的分離も自然に説明できる事例が多数見つかる
- 階層的適用が「不必要な複雑性」を生むケースが頻出する
- 単一定義（v1のみ、またはv2のみ）の方が実践的に優れている

次セクションでは、ECサイトの例を用いて仮説を検証する。

### 仮説の限界

この仮説には以下の限界があることを明示しておく：

#### 限界1：Martinの意図とは独立

- Martinが階層的適用を意図していたかは不明
- これはテキスト分析に基づく筆者の解釈である
- Martin自身がこの解釈を支持するとは限らない

#### 限界2：検証は限定的

- 本記事ではECサイトの例のみで検証する
- より多様なドメイン（組込み、インフラ、AI/MLなど）での検証が必要
- 長期的な保守性については未検証

#### 限界3：代替解釈の可能性

以下の代替解釈も検討に値する：

**代替解釈A：v2の拡張**
- v2の「アクター」を拡張し、技術的関心も包含する
- 「技術アクター」（DBA、インフラチーム）も正当なアクターとして扱う
- 組織構造と技術構造を統一的に扱う

**代替解釈B：v1の再解釈**
- v1の「変更の理由」に組織的理由も含める
- v1だけで両方の関心を扱う
- v2は不要（v1の特殊ケース）

**代替解釈C：完全置き換え**
- v2がv1を完全に置き換えた
- 技術的関心も「技術部門というアクター」で扱うべき
- 筆者の「限界」の指摘は誤り

本記事はこれらの可能性を否定しない。
ただし、現時点での分析では、階層的適用が最も整合的と判断している。

## 実践：仮説の検証—ECサイトの注文システム

前セクションで提示した仮説—「v1とv2を階層的に適用すべき」—を、
具体的な設計例で検証する。

ここでは、ECサイトの注文システムを題材に：
1. SRP違反の例から開始
2. v2（アクター）を適用してパッケージを分離
3. v1（変更の理由）を適用してクラスを分離
4. 結果として、変更の影響範囲が限定されることを確認

### なぜこの順序なのか

階層的適用では、**大きな構造から小さな構造へ**という順序で設計する：

1. **ステップ1（v2）：モジュール/パッケージレベル**
   - 組織構造を反映
   - アクター間の独立性を確保
   
2. **ステップ2（v1）：クラスレベル**
   - 技術的関心を分離
   - 同一アクター内でも、変更理由が異なるものを分ける

この順序は、Conway's Lawとも整合する：
「システムの構造は、それを設計する組織のコミュニケーション構造を反映する」

まず組織構造をソフトウェア構造に反映し（v2）、
次に技術的最適化を行う（v1）。

### 検証結果：仮説は支持されたか？

このECサイトの例では、階層的適用により：

**成果1：変更の影響範囲が限定された**
- 税率変更 → `TaxCalculator`のみ（v1による分離）
- 配送プロバイダー変更 → `/shipping/`パッケージのみ（v2による分離）
- DB技術変更 → `*Repository`クラスのみ（v1による分離）

**成果2：設計判断の根拠が明確になった**
- 「これは組織的関心だからv2で分離」
- 「これは技術的関心だからv1で分離」
- 判断基準が明確

**成果3：単一定義では扱いにくいケースに対処できた**
- アクターの粒度問題（ケース3）
- 横断的関心（ケース4）
- v1とv2を使い分けることで対処

**この事例では、仮説は支持された。**

ただし、これは一つの事例に過ぎない。
より多様なドメイン（組込み、インフラ、データ分析など）での検証が必要だ。

## 参考文献

- Robert C. Martin（2003）『Agile Software Development, Principles, Patterns, and Practices』(Pearson Education)
- Robert C. Martin（2014）『The Single Responsibility Principle』 (The Clean Code Blog)  2025-12-25 0:59閲覧
  - <https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html>
- Robert C. Martin（2017）『クリーンアーキテクチャ 達人に学ぶソフトウェアの構造と設計』(アスキードワンゴ)

