# FLAMES 🔥 — the school love game, but I coded it

**Day 1 of 100 Days Reel Challenge** by [@hack.n.code](https://instagram.com/hack.n.code) 💻

👉 **Live:** https://flames-hackncode.sites.tab.bot/

Remember writing two names on the last page of your notebook and crossing out letters? 😂
Type **your name ❤️ their name** and the site does it for you: cuts the common letters with a red pen,
counts what's left, then burns **F · L · A · M · E · S** one by one until only one letter survives.

| Letter | Result | |
|---|---|---|
| F | Friends 🤝 | Sirf dost… friendzone pakka 😂 |
| L | Love ❤️ | Pyaar hai bhai, pyaar! 😍 |
| A | Affection 🥰 | Thoda thoda pyaar ho raha hai |
| M | Marriage 💍 | Shaadi pakki! 😂 |
| E | Enemies 😤 | Bhaag ja 😂 |
| S | Siblings 🫂 | Rakhi bandhwa le 😂 |

## How FLAMES works

1. Lowercase both names and drop spaces / non-letters.
2. Cross out common letters **one-for-one** (if a name has two `a`s and the other has one, only one pair is cut).
3. Count the letters left → `n`.
4. Write `F L A M E S` in a circle. Count `n` steps from the current letter, burn the letter you land on, and start counting again from the next one.
5. The last letter standing is your result.

```js
function flames(a, b) {
  a = [...clean(a)]; b = [...clean(b)];
  for (const ch of [...a]) {
    const j = b.indexOf(ch);
    if (j < 0) continue;
    a.splice(a.indexOf(ch), 1);
    b.splice(j, 1);           // ✂️ cut
  }
  let n = a.length + b.length;
  let s = [...'FLAMES'], i = 0;
  while (s.length > 1) {
    i = (i + n - 1) % s.length;
    s.splice(i, 1);           // 🔥 burn
  }
  return s[0];                // 💍
}
```

Example: **Rahul + Bhumi** → cut `h`, `u` → 6 left → S, F, A, L, E burn → **M = Marriage 💍**

## Share a ready-made result

Add `?a=` and `?b=` to the link and it fills the names and plays automatically:

```
https://flames-hackncode.sites.tab.bot/?a=Rahul&b=Bhumi
```

## Files

- `index.html` — page structure
- `style.css` — notebook-paper + fire styling
- `script.js` — FLAMES algorithm, animation timeline, share button

Pure HTML/CSS/JS, no libraries. Open `index.html` in a browser to run it locally.

---
Made with ❤️ by **[@hack.n.code](https://instagram.com/hack.n.code)** — 100 days, 2 reels a day. Follow for the next one!
