# Emoji

## Bug

一句彩蛋： “Special thanks to C-Sisters🫡”。

如果此时你通过 macOS v12.6.1 以后的系统访问这篇文章，那么你可以在彩蛋的最后看到一个`敬礼`的 Emoji。倘若你通过 window 11 之前的系统访问，那么将看不到`敬礼`的 Emoji。

有点纳闷，本以为就是一句简单的文本，居然还有系统兼容问题。

## 前世今生

绘文字（日语：絵文字/えもじ emoji）是日本在无线通信中所使用的视觉情感符号，绘指图画，文字指的则是字符，可用来代表多种表情，如笑脸表示笑、蛋糕表示食物等。在中国，emoji通常叫做“小黄脸”，或者直称 Emoji。[百度百科](https://baike.baidu.com/item/emoji/8154456)

所以 Emoji 就是一种特殊编码到图形的映射，它比具体语言更有通用性和传播性，比如`我爱你`只有中国人看得懂，老外需要说 `i love you`，而 👦❤️👧 则世界通用。

既然是特殊字符到某种图案的映射，那么就存在系统兼容的问题比如 A 系统用 `/&xx` 代表 ❤️ ，B 系统刚好用 `/&xx` 代表 🖕️。


当男生用 A 系统的手机给女孩发消息： 我❤️你 。女孩用 B 系统的手机收到的信息则是：我 🖕️ 你。一场姻缘就此断送。

于是 [unicode](https://home.unicode.org/about-unicode/) 组织就站出来了，说无规则不成方圆，由它来统一制定标准，每个图案对应什么编码都它说了算，但是具体的实现可以交给厂商只有发挥。所以 Emoji 发展成由 Unicode 决定发布哪些图案，给出大概的绘制标准，最终由各厂商实现。

比如笑脸的图标：uinicode 组织规定其编码为 U+1F600，表现上厂商可以将其实现为😊，也可以实现成😂等。但是各厂商为了`传意`的统一都会设计出比较相似的图形。

这个网站可以看某个 Emoji 对应系统的实现效果[点我跳转](https://emojipedia.org/saluting-face/)。

## 原因

由于一些厂商比较懒，更新不及时。unicode 组织发布了一批新表情，将 Emoji 体系升级到了 v15，但是厂商的实现还停留在 v14，那么在该系统上,由 v15 新增的新表情将显示为 ‘口’ 或乱码等。而我遇到的 bug 就是 window 系统不勤快导致的。 🫡 的表情是在 Emoji@14 版本新增的， Mac 、iPhone 都有及时跟进但是微软直到 window 11 才给予实现。

[Emoji-14.0](https://emojipedia.org/emoji-14.0/)

> Emoji 14.0 is the latest set of emojis recommended for release, approved September 14, 2021 alongside Unicode 14.0.

> Additions include mixed skin tone support for 🤝 Handshake, which until now has been only default yellow on most major platforms. Other new emojis include a saluting face, a mirrored disco ball, and biting lip.

> Support for Emoji 14.0 is now available via iOS 15.4, Google's Android 12L, and Windows 11, as well as on Twitter and Facebook.

> Further platforms are expected to support Emoji 14.0 throughout 2022. 

## 链接集合

- [Emoji 的 unicode 对照表](https://unicode-table.com/cn/emoji/smileys-and-emotion/#link-face-smiling)
- [为什么不同平台 Emoji 效果不同](https://www.emojiall.com/zh-hans/blog/419)


