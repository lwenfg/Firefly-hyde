---
title: JWT 学习记录：一种无状态认证机制
published: 2026-10-18
pinned: false
image: "api"
slug: /jwt-introduction
tags: ["HTTP"]
category: 后端
draft: false
lang: ""
description: "介绍 JWT 的基本结构、签名方式、登录工作流程，以及它与传统 Session 在认证机制上的差异。"
descriptionSource: manual
---

JWT（JSON Web Token）是目前互联网开发中的开放标准（RFC 7519），用于在各方之间安全地传输信息，在Web 开发中用于**身份认证（Authentication）和信息交换**。它是一个经过数字签名的 JSON 对象，可以通过签名验证和信任，保证信息的安全传递。

### 1. JWT 的结构

JWT 由三部分Base64编码字符串组成，每部分之间用点（`.`）分隔，格式为：`Header.Payload.Signature`，例如：

~~~
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
~~~

使用Base64将其解码后，得到的就是：

~~~
{"alg":"HS256","typ":"JWT"}
{"sub":"1234567890","name":"John Doe","iat":1516239022}
xxx 签名值
~~~

需要注意的是：JWT 默认是 Base64 编码，而Base64 编码并不是一种加密算法，所以所有人都能解码看到其中的内容，相当于明文传输，不能在Payload中放敏感信息。JWT的安全性靠的是签名，使用签名算法对其签名防止篡改。

#### ① Header（头部）

描述 JWT 的元数据，通常包含两个字段：

- `alg`: 表示使用的签名算法（如 HS256, RS256）
- `typ`: 令牌类型（固定为 JWT）

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### ② Payload（载荷/负载）

存放有效数据的地方。包含三种类型的声明（Claims）：

- **注册声明**: 预定义的非强制字段，如 `iss`(签发者), `exp`(过期时间), `sub`(主题), `aud`(受众) 等。
- **公共声明**: 开发者自定义的字段。
- **私有声明**: 双方约定的自定义数据，如 `userId`, `role`, `username` 等。

```json
{
  "sub": "1234567890",      // 主题（表示用户ID）
  "name": "John Doe",
  "admin": true,
  "iat": 1516239022,        // 签发时间（时间戳）
  "exp": 1516242622         // 过期时间
}
```

#### ③ Signature（签名）

用于验证消息完整性及发送者身份。生成方式如下：

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)
```

其对`header`、`payload`使用签名算法和密钥`secret_key`进行签名，由于服务器知道`secret_key`，所以能够验签。不知道`secret_key`的无法对`header`和`payload`进行篡改。

- 如果使用的是对称算法（如 HS256），需要一个服务端密钥（Secret）。
- 如果使用的是非对称算法（如 RS256），则使用私钥签名，公钥验签。



### 2. JWT 的工作流程（以登录为例）

JWT 的工作流程核心在于**“无状态验证”**。与传统 Session 不同，服务器不需要在内存或数据库中查找会话记录，而是通过**密码学签名**来确认 Token 的合法性和完整性。



1. **用户登录**: 客户端发送用户名/密码到服务器中。

2. **签发 JWT Token**: 服务器验证客户端发送的用户名/密码通过后，使用密钥生成 JWT 并返回给客户端。

3. **携带 JWT Token**: 客户端将 JWT 存储，后续所有的请求需要在在 HTTP Header 中携带：

   ```http
   Authorization: Bearer <JWT token>
   ```

4. **验证 Token**: 服务器收到请求后，使用密钥来验证签名是否合法、是否过期。

5. **无状态特性**: 服务器**不需要**查询数据库或 Session 来验证用户身份，仅靠 Token 本身的签名即可完成验证。



### 3.JWT的特点

JWT 的最大特点是 **“自包含（Self-contained）”** 和 **“无状态（Stateless）”**：**自包含**说的是JWT本身携带了所有验证所需的信息（用户ID、角色、过期时间等），服务端无需查询数据库或缓存即可确认用户身份。**无状态性**意思是服务端不存储任何会话数据，验证过程纯粹是密码学运算（签名校验），而不用进行数据查找。



Session（会话）是一种**服务端有状态**的身份管理机制，用户登录后，服务端在内存/Redis/数据库中创建一个 Session 对象，包含用户信息，并生成一个唯一的 `Session ID`。浏览器后续请求会在 Cookie 中带上 `Session ID`，服务端收到请求后使用 `Session ID` 去存储中查找和识别对应的用户。



\> JWT和Session都实现了相似的功能：用户身份识别和登录状态维持。那他们JWT相较于Session都有哪些优势和劣势？

JWT 相较于 Session 最核心的优势在于其**无状态性**：服务端无需维护任何会话存储。Session 每次请求都需查询数据库或缓存，存在网络延迟和存储瓶颈；而 JWT 仅需本地密码学运算即可完成验证，响应更快且无外部依赖。

其次，JWT 天然具备**跨平台与跨域能力**。它通过 HTTP Header 而非 Cookie 传递凭证，不受浏览器同源策略限制。相比之下，Session 强绑定 Cookie 机制，在非浏览器场景中需要大量额外适配。



最后用一句话总结就是：**Session 是“服务端记住你”，JWT 是“你自己证明你是谁”。**或许这就是密码学的魅力~

## 参考文献

1. IETF, [RFC 7519: JSON Web Token (JWT)](https://www.rfc-editor.org/rfc/rfc7519)
2. JWT.io, [Introduction to JSON Web Tokens](https://jwt.io/introduction)
