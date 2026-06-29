---
title: "Multi-Agent並行開発を安全に回すために、worktree間のコンフリクトを検出するツールを作った話"
emoji: "🧰"
type: "tech"
topics: ["git", "ai", "claudecode", "codex", "gitworktree"]
published: false
---

## 背景

本稿は、2026年6月30日に開催された「コーディングエージェント ハーネスエンジニアリング LT大会！！」での発表を背景としている。

https://mlops.connpass.com/event/395882/

スライド上では省略して口頭で説明した内容を文書で補うことで、イベントに参加していなかった人も同水準以上の情報を得られる導線を確保することが、本稿の目的となる。

発表に使用したスライドは以下。

https://speakerdeck.com/tooppoo/multi-agentbing-xing-kai-fa-wo-an-quan-nihui-sutamenoji-shu

## AIエージェントの複数実行・並列作業

コーディングエージェントを使った開発がだいぶ身近になってきた。

エージェントの登場から「複数のAIエージェントを起動して、複数タスクを並行に進めたい」という発想の登場は、割と早かったように思う。

実際、AIエージェントを何個同時に動かしているか、どのように複数タスクを並列化しているか、という話題はよく見かける。
そこには、「複数のAIを並列に動かしていれば動かしているほど、AIを使いこなしている」という発想があるように思う。

ただ、実際にやってみると、単にエージェントの数を増やせばよいという話ではないことがわかる。

複数のエージェントを同じプロジェクト上で動かすには、それぞれの作業空間を分ける必要がある。
さらに、作業空間を分けたとしても、複数のエージェントが同じファイルを編集してコンフリクトが発生する問題も残る。

前者は git worktree で対応できる。ただし、コマンドの使い方は若干面倒である。
後者に関しては、git worktree単体でのサポートは特に無く、別途の対応が必要になる。

そのあたりを簡便かつ安全に扱うために、最近 `git-kura` というGitサブコマンドを作っている。

https://github.com/tooppoo/git-kura

この記事では、AIエージェントによる並行開発で `git worktree` がなぜ便利なのか、そのうえで何が足りないのか、そして `git-kura` で何を解決しようとしているのかを整理する。

## `git worktree`とAIエージェント

複数のAIエージェントに同じプロジェクトで並行作業させたいとき、まず問題になるのは作業場所である。

1つのディレクトリ上で複数のエージェントを同時に動かすと、どのエージェントがどのファイルを変更したのか、どの差分がどのタスクに対応しているのかがすぐに混ざる。

そこで昨今注目されてきているのが [`git worktree`](https://git-scm.com/docs/git-worktree) だ。

`git worktree` は、同じrepositoryに複数のworking treeを紐づけるための仕組みだ。たとえば、リポジトリ本体が `/path/main` にあるとして、次のようなコマンドを実行できる。

```bash
git worktree add /path/other/test-next next
```

この場合、`/path/other/test-next` という別ディレクトリに、`next` branchに対応したworktreeが作られる。

![git worktreeコマンドの図解。 `/path/main` にあるgitリポジトリでコマンドを実行した結果、`/path/other/test-next`というworktreeが作成されていることを図示している](/images/tech_for_safely_multi-agent_parallel_dev/git-worktree.png)

ポイントは、リポジトリ本体が `/path/main` にある一方で、追加されたworktreeは `/path/other/test-next` という別パスに存在することだ。

つまり、作業空間そのものが分かれる。

AIエージェントAにはworktree Aを、AIエージェントBにはworktree Bを使わせる。そうすれば、両者は互いに独立した作業領域で、互いに干渉し合うことなく作業を進められる。

`git worktree` 自体はAIエージェント以前からあるGitの仕組みだが、複数エージェントによる並行作業と相性がよかったため、改めて注目されているのだと思う。

## git branchとgit worktreeを机で考える

`git branch` と `git worktree` の違いについて、机と書類の比喩で考えてみる。

机の上に作業用の書類が山積みされており、保管庫には他にも色々な作業用資料が山積みされている。作業できるのは、机の上にある書類だけだとする。

`git branch` 運用の場合、用意されている机は1つである。複数のbranchは存在するが、それはここで言うところの「保管庫に山積みされている」状態にある。
実際に作業できるのは、現在その机の上に展開されているbranchだけだ。

別のbranchで作業したくなったら、`git switch` などで机の上の書類を入れ替えることになる。
これの繰り返しで、1箇所で複数種類の作業を可能にするのが `git branch` の効能と言えるだろう。

一方で、`git worktree` は机そのものを増やすイメージだ。

worktree Aという机にはbranch Aの書類が置かれている。
worktree Bという机にはbranch Bの書類が置かれている。
作業を変えたいときは、机の上の書類を入れ替えるのではなく、作業者が別の机へ移動する。

![画像左側にbranchの表現。1つの机に書類が置かれており、他に3つ書類がある。机上の書類とその他の書類を入れ替える矢印を描くことで、branch切り替えの仕組みを表現している。画像右側にworktreeの表現。4つの机それぞれに1つずつ書類が置いてある。1つの机から別の机に矢印が伸びた先に鉛筆のアイコンが描かれることで、worktree移動の仕組みを表現している](/images/tech_for_safely_multi-agent_parallel_dev/metaphor-branch-and-worktree.png)

この違いは、複数AIエージェントを動かすときに大きな意味を持つ。

机が1つしかなければ、複数のエージェントを同時に作業させるのは難しい。しかし、机が複数あれば、それぞれの机に別々のエージェントを配置できる。

`git worktree` は、複数エージェントにそれぞれ別の机を渡すための仕組みとして使える。

![画像の左側にbranchとAIの表現。1つの机の上にAIが載っている。画像の右側にworktreeとAIの表現。4つの机それぞれにAIが載っている](/images/tech_for_safely_multi-agent_parallel_dev/metaphor-branch-and-worktree-with-ai.png)

## 作業コンフリクトの問題

ただし、`git worktree` は万能ではない。

worktreeは作業空間を分けてくれるが、作業対象の衝突までは防いでくれない。マージコンフリクトの問題が、そのまま表れてくる。

たとえば、エージェントAがあるworktreeで `src/main.rs` を変更し、エージェントBも別のworktreeで `src/main.rs` を変更したとする。
作業ディレクトリは分かれているから、その変更は互いに干渉することなく完了する。
しかし最終的に変更を統合するとき、同じファイルに対する変更が衝突する可能性はある。

![複数AIの並列作業によるコンフリクトを図示する画像。複数のAIと複数のファイルが横並びで描かれている。複数のAIが同じファイルに矢印を向けている](/images/tech_for_safely_multi-agent_parallel_dev/conflict-multi-agents.png)

実際の所、これは最近生じた問題ではない。従来のチーム開発でも、しばしば起きていた問題である。複数の開発者が同じファイルを変更していれば、merge時にconflictが発生する。
そこでconflictの原因となったPRの作成者を探し、変更の意図を確認し、時には一緒にdiffを眺めながら最終的にどういう形になっているべきかを確認しあう、などしたこともあるかもしれない。

閑話休題。

AIエージェント時代には、この問題がローカル環境でも起きやすくなったということだ。
人間が複数のAIエージェントをローカルで同時に動かすと、1人の開発者の手元で、複数人開発のような競合が発生するためである。

今まではチーム開発上の問題だったものが、Multi Agentの開発では、ローカル開発環境の問題としても現れてくる。

## 解決より予防

merge conflictが起きた後にAIへ解決を頼むこともできる。
単純なconflictであればそれで済ませ良いし、機械的に解決できるconflictならAIに任せてもよいと思う。

しかし、複雑なconflictでは不安が残る。

コード上の衝突に見えても、実際には設計判断や仕様変更が絡んでいることがある。
diffだけでは一見してわかりにくいところに「残すべきもの」「消すべきもの」「残されてはいけないもの」「消されてはいけないもの」が潜んでいることもあるのが、conflictの怖いところだ。
そういうものをAIが勝手に「それっぽく」解決してしまうのは危うい。

そもそもconflictが起きないように、人間が事前に完全なタスク分割を行うという発想もあるだろう。
また、そのために変更を局所化させやすい設計あるいはファイル構成にしておくという発想もあるだろう。

しかし、これは実現・運用までのコストが高く、しかも、確実ではない。
タスクを分けたつもりでも、領域を分割しておいたつもりでも、実装してみると同じファイルを触る必要があった、というのは往々にしてある。

しかしながら、conflictが起きてから頑張って解決するのではなく、conflictをそもそも起こさないという発想には可能性があると思う。

ここで重要なのは、「conflictを起こさない分割を行う」ではなく、「conflictが起きそうになった瞬間を検知できる」ということではないかと思う。
特に、同一ファイル編集に起因するfile-level conflictは、比較的機械的に検出できる。

すべての衝突を機械的に防ぐことはできない。別々のファイルを変更していても、意味的には衝突していることがある。
たとえば、あるエージェントがAPIを変更し、別のエージェントが旧API前提のコードを書いていた、というようなケースだ。

このような意味的な衝突は、テストやレビュー、設計判断で扱う必要がある。

一方で、「同じファイルを複数のエージェントが、別々のworktreeで、同時に編集しようとしている」という状態は、より機械的に検出できる。

このfile-level conflictを、merge時ではなく、編集前に止めたい。

そのために作っているのが `git-kura` である。

## git-kuraとは何か

`git-kura` は、複数worktreeでの並行作業を安全に進めるためのGitサブコマンドである。

![git-kuraのsocial view用画像. 画像左側にgitアイコンのついた「蔵」のアイコンが書かれている。画像右側には"conflict-aware git-worktree coordinater"と書いてある](/images/tech_for_safely_multi-agent_parallel_dev/git-kura-social.png)

`git-kura` はAIオーケストレータではない。したがって、AIエージェントを起動したり、タスクを自動分配したりすることを目的にはしていない。

`git-kura` が扱うのは、もう少し低いレイヤーである。具体的には、以下が `git-kura` が主として扱うレイヤーである。

* worktreeを決定論的（deterministic）に管理する
* どのworktreeがどのパスにあるかをコマンドで取得できるようにする
* repository共通のstore fileを使って、どのworktreeがどのファイルをclaimしているかを管理する
* すでにclaim済みのファイルを別worktreeがclaimしようとしたら拒否する
* pre-commit hookで、seal状態に反するcommitを弾く

要するに、AIエージェントに「たぶんこのworktreeで作業しているはず」と推測させないための道具である。

人間の注意やプロンプトの善意に依存するのではなく、コマンドの成否で判断させる。

## seal claimの仕組み

`git-kura` では、ファイルを編集する前に `seal claim` する。

たとえば、worktree Aが `file1.txt` を編集したい場合、次のようにclaimする。

```bash
git kura seal claim file1.txt
```

claimが成功すると、repository共通のstore fileに「worktree Aが `file1.txt` をclaimしている」という情報が記録される。

この状態で、worktree Bが同じ `file1.txt` をclaimしようとすると、`git-kura` は拒否する。

```bash
git kura seal claim file1.txt
# file1.txt sealed by a
# exit non-zero
```

コマンドが失敗するので、AIエージェントはそのまま作業を続行できない。

AIに「他のworktreeと衝突しないように注意して」と頼むのではなく、衝突しそうなファイルを触ろうとした時点で、コマンドが失敗する仕掛けを作っておく。

merge時に初めてconflictが発覚するのではなく、編集前に止めさせるのが、 `git-kura` の狙いである。

![worktree a・b・c があり、repository root の共有storeには worktree a が file1.txt を claim 済みであることが記録されている。worktree b のAIエージェントが git-kura に対して git kura seal claim file1.txt を実行し、file1.txt のclaimを要求している。](/images/tech_for_safely_multi-agent_parallel_dev/git-kura-claim.png)
![git-kura が共有storeを確認し、file1.txt はすでに worktree a によって seal されていると判定している。そのため git kura seal claim file1.txt は non-zero exit で失敗し、worktree b のAIエージェントは処理を続行できない。](/images/tech_for_safely_multi-agent_parallel_dev/git-kura-claim-failed.png)

## 実際に止まった例

`git-kura` の開発そのものでも、`git-kura` を使っている。

実際に、あるIssueの作業を進めようとしたとき、別のIssue用worktreeがすでに必要なファイルをclaimしていたため、AIエージェントが作業を停止したことがある。以下は、その時のログである。

![Issue #43 の作業に必要な2ファイルが別worktreeでclaim済みだったため、git-kura が競合を検出し、AIエージェントが作業を停止して人間に判断を求めているログ。](/images/tech_for_safely_multi-agent_parallel_dev/git-kura-conflict-log.png)

具体的には、Issue 43の作業を進めるために必要なファイルが、すでにIssue 31の作業でclaimされていた。
AIエージェントは、そのファイルを勝手にunclaimしたり、sealを無視して編集したりせず、「この作業は進められない。どうしますか」と人間に判断を求めた。

ここで重要なのは、conflictの可能性が検知され、それを受けてAIが作業を止め、人間へ報告したことにある。

multi-agent開発では、すべてをAIに任せることよりも、AIが進めてはいけない場面で確実に止まることの方が重要になる場合がある。

## pre-commit hookは最後の砦

ただし、`git-kura` にも限界はある。

AIエージェントが `git-kura` を無視してファイルを変更すること自体は、防げない。ファイルシステム上の書き込みを完全に禁止しているわけではないからだ。
`git-kura`による防御はあくまで協調的なものであり、そのプロトコルに従わないエージェントの存在を排除することまではできない。

そこで `git-kura` は、最後の砦としてpre-commit hookを提供する。

`git-kura` のseal状態に反する変更がcommitされそうになった場合、pre-commit hookでcommitを弾く仕組みを用意しておく。

これは、変更そのものを防ぐ仕組みではない。しかし、少なくとも「sealを無視した変更が、そのままcommitされる」ことは防げる。

また、`git-kura` には次のようなツールセットをrepository localに追加するためのコマンドも用意している。

```bash
git kura tools install --all
```

これにより、Codex用Skill、Claude用Skill、pre-commit hook設定などをまとめて配置できる。

AIエージェントに `git-kura` を使わせるための指示と、Git側で最後に止める仕組みを、repository単位で管理できるようにするのが狙いである。

## 解決できること、できないこと

`git-kura` のスコープは、主にfile-level conflictの事前検知である。

同じファイルを複数のworktreeが同時に編集しようとしている場合、それを編集前に止めることでconflictを早期に検知する。
早期に検知できれば、作業順序の調整など行うことで、そもそもconflictを発生させない選択が可能になる。

一方で、`git-kura` は意味的な衝突までは防げない。

たとえば、別々のファイルを編集していても、片方の変更がもう片方の前提を壊していることがある。これはファイル単位のclaimだけでは検出できない。

また、claimの粒度をファイル単位にしているため、同じファイル内の独立した箇所を別々に編集できるケースでも、片方は止まる。
これは保守的な設計である。並行性を最大化するよりも、AIエージェントによる予期しない競合を早めに止めることを優先している。

## まとめ

複数のAIエージェントを並行で動かすと、開発速度は上がる。しかし、速くなるほど、作業状態が混ざったときの被害も大きくなる。

`git worktree` は、作業空間を分けるための有効な仕組みである。branchを切り替えるのではなく、worktreeごとに別の作業ディレクトリを用意できる。
これは、複数エージェントを同時に動かすうえで相性がよい。

ただし、worktreeは作業空間を分けるだけで、作業対象の衝突までは防がない。
`git-kura` は、その隙間を埋めるための小さなGitハーネスである。

worktreeを決定論的に管理し、ファイル単位のseal claimによって、同一ファイル編集に起因する衝突を編集前に止める。
さらにpre-commit hookによって、`git-kura` を無視した変更がそのままcommitされることを防ぐ。

multi-agent開発では、agentを増やす前に、作業状態を混ぜない、衝突させない仕組みが必要だと考えている。

`git worktree` は机を増やす。
`git-kura` は、どの机でどの書類に触ってよいかを調停する。

そんな道具として、`git-kura` を育てていきたい。

## 参考リンク

* [git worktree - Git公式ドキュメント](https://git-scm.com/docs/git-worktree)
* [git branch - Git公式ドキュメント](https://git-scm.com/docs/git-branch)
* [Git Worktree Isolation Patterns for Parallel AI Agent Development](https://zylos.ai/research/2026-02-22-git-worktree-parallel-ai-development/)
* [git-kura](https://github.com/tooppoo/git-kura)
