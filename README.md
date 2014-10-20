おもてなーじ
=====
「おもてなーじ」とは，「おもてなし」と「サイネージ」を組み合わせた造語です．
おもてなしの精神をサイネージするためのシステムを目指し，この名称をつけました．

<p align="center">
  <img src="https://raw.githubusercontent.com/kobasemi/WebRTCCon/master/webrtc/img/logo.png" alt="Omotenage Logo"/>
</p>

このシステムは，関西大学総合情報学部の小林研究室のメンバーが，
[第1回 NTT-WEST学生向けアプリ開発コンテスト](https://www.facebook.com/nttw.w.con)
に応募するために開発しました．

概要
=====
おもてなーじは，主に外国人観光客への案内を想定し（特に2020年東京オリンピックに向けて），
[WebRTC](http://www.webrtc.org/)を利用したリアルタイムガイドを支援するシステムです．

Webブラウザを利用したFace to Face の対話を可能としており，利用に特別なアプリやプラグインは必要ありません．
また独自のリコメンデーションエンジンを実装し，コミュニケーションを通じて知り得たクライアントの情報をもとに，
そのクライアントのみを想定したスペシャルなページを提供します.

海外から訪れる人々に日本の魅力，ひいては日本人のおもてなしの心を体感してもらうことが目的です．

詳細については，プロジェクト内にマニュアル（[README.html](/webrtc/README.html)）を用意してありますので，
そちらをご覧ください．


システム利用の流れ
=====
おもてなーじでは，オペレータとクライアントの二人の存在が必要となります．
以下，利用の流れの一例をペルソナを用いて説明します．

* オペレータ: Mizuho（東京在住，大学生，中国語が話せる，グルメ）
* クライアント: Chen（中国人，30代から40代，夫婦で初来日）

2020年，東京オリンピック開催の年となり，東京ひいては日本に多くの観光客が訪れた．
その折，今回初めて来日された中国人夫婦は，今日行われる新体操競技の会場への行き方が
地図を見て理解できなかった．周りに観光案内用端末も見当たらず，頼れそうな人もいなかった．
そこでChenさんは，スマートフォンを取り出し「おもてなーじ」へ接続をした．

オペレータであるMizuhoは，このとき既に「おもてなーじ」のオペレータ専用ページに接続し，
中国人観光客からの受付をしていた．

Chenさんは，「おもてなーじ」に接続したのち，最初のページ（index.html）に表示されている国のリストから，
自国である中国を選択した．そして次ページに書かれている注意文を読み，OKボタンを押した．
オペレータ選択画面に移った後，表示されているオペレータリストから，
Mizuhoと書かれた自国の国旗のネクタイをしたアイコンを選択し，下部にあるCALLバーをクリックした．
MizuhoはChenさんからの発信に対し応答し，ここで両者の通信が開始された．

Chenさんは，現在の自分の状況，会場への行き方が分からないことをMizuhoに伝えた．
MizuhoはChenさんの現在位置情報を確認し，会場まで十分程度歩く必要があることを知った．
そこで，MizuhoはChenさんにそのことを伝え，会場までの道案内を開始した．
リアルタイムでChenさんの位置情報を確認し，細かく指示することで，複雑にくねった道であっても，
スムーズに向かうことができた．
ガイド中，MizuhoはChenさん夫婦と打ち解けることができ，Chenさん夫婦との会話に日本食の話題が出たことから，
裏で独自のリコメンデーションエンジンを作動させた．
日本食が食べられることや会場付近にあること，競技後の時間でも開店していること，
中国語での応対が可能であることといった，複数の要素をもとにデータベース内を検索することで，
いくつかの候補地が見つかった．

会場まで辿り着いたChenさん夫婦は，Mizuhoに別れの挨拶を行った．
Mizuhoは先ほど検索した情報について，Chenさんに説明し，
それらの情報を纏めたお勧めページを送信した．

最後に，Chenさんは通話画面の下部に表示されたそのページへのリンクをクリックし，
Mizuhoとの通話を切断した．

コード利用にあたって
=====
おもてなーじ内で利用しているAPIのキーを，各自で用意したものに置き換えてください．
SkyWay，及びGoogle Maps JavaScript API v3のAPIキーに関しては，
"www.firefly.kutc.kansai-u.ac.jp" のドメインでのみ利用できるようにしております．
（なお，Google Maps APIに関しては，キーを無くても利用できるようです．）

* [SkyWay](http://nttcom.github.io/skyway/)

開発者登録を行い，APIキーを取得したのち，以下のファイルを編集してください．

client.js, operator.js内のAPIKEYの値を，自ドメイン用に取得したキーに編集します．

    // Skyway API Key for The Domain: www.firefly.kutc.kansai-u.ac.jp
    var APIKEY = "79e1e834-4935-11e4-878c-e1a8ecd1a309";

* [Microsoft Translator API](http://www.microsoft.com/translator/web-localization.aspx)

APIキーの取得方法については詳しい説明は行いませんが，
まず，[Microsoft Azure Marketplace](https://datamarket.azure.com/)に登録し，
[Microsoft Translator API](https://datamarket.azure.com/dataset/bing/microsofttranslator)を
有効にします．その後，アカウントページにあるプライマリ アカウント キーを確認した後，以下のファイルを追加してください．

/webrtc/php/ディレクトリのなかに，下記コードが書かれたapikey.phpという名のファイルを作成します．

    <?php
      const APPID = 'Put Your Primary Account Key into HERE';

* [Google Maps API](https://developers.google.com/maps/documentation/javascript/)

[デベロッパーガイド](https://developers.google.com/maps/documentation/javascript/tutorial#api_key)を
参考にAPIキーを取得してください．取得後，そのキーが利用できるドメインを登録します．
その後，client.html，及びoperator.htmlのファイル内の以下の箇所を編集してください．

    src="https://maps.google.com/maps/api/js?key={Put Your API Key into HERE}&sensor=true"

なお，現状はこのキーを削除しても動作するようです．
その場合は，以下のように編集します．

    src="https://maps.google.com/maps/api/js?sensor=true"

動作環境
=====
「おもてなーじ」ではWebRTCの機能を使っておりますが，
2014年10月20日現在，Internet ExploreやSafariなどのブラウザに対応してません．
またiOS用では利用できません．

我々のほうで確認した環境は下表になります．

|OS     | Chrome | Firefox | Opera | Safari|
|-------|--------|---------|-------|-------|
|Android| ◯      | ◯       | ◯     |       |
|iOS    | -      | -       | -     | -     |
|OS X   | ◯      | ◯       | ◯     | -     |

Androidでの動作確認には，Nexus 5, 7（Android 4.4-Kitkat-）を使用しています．
使用には，最新のOSを利用するようにしてください．

著者
=====
team Kobasemi

ライセンス
=====
[*MIT License*](/LICENSE)
