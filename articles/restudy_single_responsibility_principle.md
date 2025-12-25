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

## 批判的分析：定義の変遷とその意味

### 定義の変遷

SRPの定義変更は一気に起こったわけではない。段階的に変化していた：

| 時期 | 定義 | 焦点 | レベル |
|------|------|------|--------|
| 2003（ASD） | 変更の理由 | 技術的結合 | クラス設計 |
| 2014（Blog） | 人々・組織 | 組織的関心への転換 | 過渡期 |
| 2017（CA） | アクター | 組織的結合 | アーキテクチャ |

2014年のブログは、v1からv2への**橋渡し**だった。「変更の理由」を「人々」と明示的に結びつけることで、組織的な視点への転換が始まった。

### 誤解の原因と定義変更

Martinは2017年、従来の表現が誤解を招いたことを認めている：

> おそらくその原因は、名前があまりよくなかったことだ。

「変更の理由」という表現は、「一つのことだけをする」という誤解を生んだ。そこでMartinは、より明確な概念—「アクター」—を導入した。

**しかし、重要な点を指摘しておく：Martinはなぜv1からv2へ定義を変更したのか、その理由そのものは明示していない。**「名前があまりよくなかった」は、**誤解が広がった原因**であって、**定義変更の理由**ではない。名前が問題なら、原則名を変更すべきだが、「Single Responsibility Principle」という名前は変わっていない。

CAの「最終的な単一責任の原則（SRP）は以下のようになる」という表現は、v2がv1を**置き換える**ことを示唆している。しかし、v1が無効になったのか、それとも依然として有効な別のレベルの原則なのかは、**明示されていない**。

### 二つの定義の実質的差異

定義変更の理由が明示されていない以上、二つの定義の**内容の差異**を分析することで、Martinの意図を推測するしかない：

| 観点 | v1（変更の理由） | v2（アクター） |
|------|-----------------|---------------|
| 問題の焦点 | 技術的結合 | 組織的結合 |
| 主な例 | Rectangle（GUI vs 計算）、Modem | Employee（CFO vs COO vs CTO） |
| 適用レベル | クラス設計 | モジュール・アーキテクチャ |
| 判断の基準 | 技術的変更パターン | 組織構造・ステークホルダー |

この差異から見えるのは、単なる用語の明確化以上のものだ。v1とv2は、**扱う問題の性質そのものが異なる**。

### v2の限界：技術的分割の扱いにくさ

v2の「アクター」概念は、組織的ステークホルダーを前提としている。しかし、純粋に技術的な関心事（レイヤー分離、ライブラリ依存の最小化）を「アクター」として表現するのは不自然だ。

例えば：
- 「データベース層」は誰のアクターなのか？DBA？それとも永続化を必要とする全アクター？
- 「GUIライブラリの変更」を要求するアクターは誰なのか？

v1の「変更の理由」なら、「DB技術の変更」「GUIライブラリのバージョンアップ」と、主体を問わず変更理由を直接表現できる。

さらに、v2の「アクター」は組織単位（部門、役職）を想定するが、技術的関心はより細かい粒度で発生する。同じCFOアクターでも、「給与計算ロジック」と「税務計算ロジック」は異なる変更理由を持つ可能性がある。

2014年のブログでMartinは凝集度・結合度との関係を述べているが、v2では技術的関心の扱いが後退している。

### 階層的適用の提案—曖昧性への一つの解釈

**前提の明示：以下は筆者の独自解釈である。Martinはv1とv2の関係を明示していない。v2がv1を置き換えるのか、両者が共存するのか、どのレベルでどちらを使うべきかは、明確に語られていない。**

その曖昧性を踏まえた上で、ここでは一つの解釈—**階層的適用**—を提案する。

Martinの定義の変遷を観察すると、v1を**捨てた**というよりは、より上位のレベルに**視点を拡張した**と解釈できる可能性がある。つまり：

- **v1（クラスレベル）**：技術的変更理由による分離
- **v2（モジュール・アーキテクチャレベル）**：組織的関心による分離

この解釈の根拠：
1. v1とv2の例が扱うレベルが異なる（クラス vs モジュール/パッケージ）
2. 2014年のブログで「reasons for change are people」と述べながら、凝集度・結合度への言及も残している
3. v2のアクター概念は、クラスレベルの技術的分離を自然に表現できない

この階層的解釈により：
- 大きな構造では組織構造を反映し、アクター間の独立性を確保
- 小さな構造では技術的変更理由を反映し、変更の影響範囲を限定

両者は対立するのではなく、**異なるレベルで補完し合う**可能性がある。

**ただし、これはあくまで一つの解釈である。**Martinが実際にこの階層的適用を意図していたかは不明だ。読者は、この提案を批判的に検討し、自身の文脈で妥当性を判断してほしい。

## 実践：ECサイトの注文システムでの適用

### 悪い例：すべてが混在している

まず、SRPに違反している典型例を見てみよう。

```java
class Order {
    private Customer customer;
    private List<OrderItem> items;
    
    // 経理部門の関心
    public BigDecimal calculateSubtotal() { ... }
    public BigDecimal calculateTax() { ... }
    public BigDecimal applyDiscount(String couponCode) { ... }
    public BigDecimal calculateTotal() { ... }
    
    // 在庫部門の関心
    public boolean reserveInventory() { ... }
    public void releaseInventory() { ... }
    
    // 配送部門の関心
    public Shipment arrangeShipping() { ... }
    public void updateShippingStatus(String status) { ... }
    
    // 顧客向け機能
    public void sendConfirmationEmail() { ... }
    public OrderHistory getOrderHistory() { ... }
    
    // 技術的関心
    public String renderOrderPage() { ... }  // UI描画
    public void saveToDatabase() { ... }     // 永続化
}
```

この設計の問題を、変更シナリオで確認しよう。

**シナリオ1：消費税率が変更された**
- `Order`クラス全体を変更
- すべての機能（在庫・配送・顧客）を再テスト
- システム全体を再デプロイ

**シナリオ2：配送プロバイダーを変更した**
- `Order`クラス全体を変更
- 経理計算も再テスト（本来は無関係なのに）

**シナリオ3：DBをPostgreSQLからMongoDBに移行**
- `Order`クラス全体に影響
- ビジネスロジックも巻き込まれる

### ステップ1：v2適用—アクター単位でパッケージ分離

まず、v2の観点でアクターを特定する：

- **経理部門（CFO）**：価格・税・割引の計算
- **在庫部門（COO）**：在庫の引当・管理
- **配送部門（物流責任者）**：配送の手配・追跡
- **顧客**：注文確認・履歴閲覧

これに基づき、パッケージを分離する：

```
/order-management/
  /billing/              ← 経理部門アクター
    OrderBillingService
    
  /inventory/            ← 在庫部門アクター
    InventoryReserver
    
  /shipping/             ← 配送部門アクター
    ShipmentArranger
    
  /customer/             ← 顧客アクター
    OrderConfirmationService
    
  /infrastructure/       ← 技術的関心（アクターではない）
    OrderRepository
    OrderPresenter
```

この時点で、変更の影響範囲は限定される：

- 税率変更 → `/billing/`のみ
- 配送プロバイダー変更 → `/shipping/`のみ

しかし、まだ不十分だ。

### ステップ2：v1適用—技術的変更理由でクラス分離

`/billing/`パッケージ内を見てみよう。`OrderBillingService`には、複数の変更理由が混在している：

- 価格計算方式の変更（商品価格の合計方法）
- 税法の変更（税率、課税対象）
- 割引ルールの変更（クーポン、キャンペーン）

これらは、**同じ経理部門アクター**だが、**異なる変更理由**を持つ。v1の観点で分離する：

```java
/billing/
  // 価格計算ロジック
  class PriceCalculator {
      BigDecimal calculateSubtotal(List<OrderItem> items) {
          return items.stream()
              .map(item -> item.getPrice().multiply(
                  BigDecimal.valueOf(item.getQuantity())))
              .reduce(BigDecimal.ZERO, BigDecimal::add);
      }
      // 変更理由：価格計算方式の変更
  }
  
  // 税計算ロジック
  class TaxCalculator {
      BigDecimal calculateTax(BigDecimal amount, Address address) {
          TaxRate rate = taxRateRepository.findByRegion(address.getRegion());
          return amount.multiply(rate.getRate());
      }
      // 変更理由：税法の変更
  }
  
  // 割引計算ロジック
  class DiscountCalculator {
      BigDecimal applyDiscount(BigDecimal amount, String couponCode) {
          Coupon coupon = couponRepository.findByCode(couponCode);
          return amount.multiply(
              BigDecimal.ONE.subtract(coupon.getDiscountRate()));
      }
      // 変更理由：割引ルールの変更
  }
  
  // 請求サービス（上記を統合）
  class OrderBillingService {
      private final PriceCalculator priceCalc;
      private final TaxCalculator taxCalc;
      private final DiscountCalculator discountCalc;
      
      BigDecimal calculateTotal(Order order) {
          BigDecimal subtotal = priceCalc.calculateSubtotal(order.getItems());
          BigDecimal discount = discountCalc.applyDiscount(
              subtotal, order.getCouponCode());
          BigDecimal taxable = subtotal.subtract(discount);
          BigDecimal tax = taxCalc.calculateTax(taxable, order.getAddress());
          return taxable.add(tax);
      }
  }
  
  // 永続化（技術的関心）
  class BillingRepository {
      void saveBillingRecord(BillingRecord record) {
          // DB操作
      }
      // 変更理由：DB技術の変更、スキーマ変更
  }
```

同様に、`/infrastructure/`パッケージも技術的関心で分離する：

```java
/infrastructure/
  /persistence/
    class OrderRepository {
        // 変更理由：DB技術、ORM、スキーマ
    }
  
  /caching/
    class OrderCache {
        // 変更理由：キャッシュ戦略
    }
  
  /presentation/
    class OrderPresenter {
        // 変更理由：UI技術、テンプレートエンジン
    }
```

### 変更シナリオの再検証

階層的適用後、変更の影響範囲を再確認しよう。

**シナリオ1：消費税率が変更された**
- Before：`Order`クラス全体
- After：`TaxCalculator`のみ

**シナリオ2：配送プロバイダーを変更した**
- Before：`Order`クラス全体
- After：`ShipmentArranger`のみ

**シナリオ3：DBをPostgreSQLからMongoDBに移行**
- Before：`Order`クラス全体
- After：`OrderRepository`のみ（インターフェースは維持）

**シナリオ4：経理部門がクーポン戦略を頻繁に変更する**
- Before：`Order`クラス全体
- After：`DiscountCalculator`のみ
  - v2により、他部門に影響しない
  - v1により、同じ経理部門内でも`TaxCalculator`に影響しない

### 判断に迷うケース

実践では、必ず灰色地帯が生じる。

**ケース1：注文確定処理（複数アクターの調整）**

```java
class OrderProcessor {
    void processOrder(Order order) {
        billingService.charge(order);      // 経理
        inventoryService.reserve(order);   // 在庫
        shippingService.arrange(order);    // 配送
        customerService.notify(order);     // 顧客
    }
}
```

これは複数アクターにまたがるが、SRP違反ではない。`OrderProcessor`は**調整役（Coordinator）**であり、各アクターの責任は適切に分離されている。

ただし、この中にビジネスロジック（例：「在庫確保失敗時の決済キャンセル」）が入り始めたら要注意だ。

**ケース2：共通ユーティリティ（技術的関心の優先）**

```java
class DateFormatter {
    String formatOrderDate(Date date) { ... }
}
```

すべてのアクターが使う共通機能だ。v2的には複数アクターだが、これは**技術的関心**が支配的なケース。v1の観点を優先し、`/infrastructure/common/`に配置する。

変更理由は「日付フォーマット規約の変更」であり、特定のアクターに紐づかない。

## 実践的な使い分け指針

### 判断フロー

SRPを適用する際、以下の順序で判断する：

1. **設計の対象は何か？**
   - パッケージ・モジュール構造 → 次へ
   - クラス設計 → 3へ

2. **主な関心は組織的か技術的か？**
   - 組織的（部門、ステークホルダー） → v2（アクター）を適用
   - 技術的（レイヤー、技術スタック） → v1（変更の理由）を適用

3. **変更理由を列挙できるか？**
   - 複数の独立した変更理由がある → v1を適用して分離
   - 一つの変更理由のみ → 分離不要

4. **分離のコストは？**
   - 実際に変更が予想される → 分離する
   - 現時点で変更の兆候がない → 「不必要な複雑性」を避け、分離しない

### クラス図・ユースケース図との接続

**クラス図からv1を適用する手順：**

1. 対象クラスの責務を列挙する
2. 各責務について「何が変わったら、この部分を変更するか？」を問う
3. 変更のトリガーが異なる責務を特定する
4. 分離の判断（変更の頻度とコストを考慮）
5. 必要ならリファクタリング実施

**ユースケース図からv2を適用する手順：**

1. ユースケース図からアクターを抽出
2. 各アクターが関与するモジュール・クラスを特定
3. 複数アクターが関与するモジュールを洗い出す
4. モジュール分割の検討（FacadeパターンやData分離など）
5. パッケージ構造への反映

## 結論

SRPは、一見シンプルに見えて奥深い原則だ。「一つのことだけをする」という誤解は根強いが、原典に立ち返れば、SRPの本質は「変更の理由」や「アクター」による責任の分離にある。

本記事で明らかにしたのは、Martinが定義を**段階的に変更していた**ことだ：

- **2003年（ASD）**：技術的結合の問題、「変更の理由」
- **2014年（Blog）**："This principle is about people"—組織的関心への転換
- **2017年（CA）**：「アクター」による明確化、アーキテクチャレベルへの拡張

しかし、**なぜ定義を変更したのか、v1とv2はどう関係するのか**については、Martinは明示していない。

本記事では、この曖昧性に対する一つの解釈として、両者を階層的に適用する枠組みを提案した：

- **パッケージ・モジュールレベル**：v2（アクター）で組織構造を反映
- **クラスレベル**：v1（変更の理由）で技術的関心を分離

これはあくまで筆者の試案であり、Martinの意図を完全に反映しているかは不明だ。しかし、実践的には有用な枠組みだと考える。

SRPを語る際、「どのレベルのSRPか？」「どちらの定義を使っているのか？」を自覚することが重要だ。そして何より、原典に基づいた正確な理解—**そこに書かれていることと、書かれていないことの区別**—が、正当な評価と実践的な適用の前提となる。

定義や原則を語る際は、常に出典を確認すべきだ。同時に、原典に書かれていない部分については、それが解釈であることを明示すべきだ。それこそが、技術コミュニティ全体の知的誠実性を保つ道である。

---

## 参考文献

- Robert C. Martin（2003）『Agile Software Development, Principles, Patterns, and Practices』(Pearson Education)
- Robert C. Martin（2014）『The Single Responsibility Principle』 (The Clean Code Blog)  2025-12-25 0:59閲覧
  - <https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html>
- Robert C. Martin（2017）『クリーンアーキテクチャ 達人に学ぶソフトウェアの構造と設計』(アスキードワンゴ)

