<!--
  boya theme preview
  ------------------
  This file exercises every TextMate scope the boya themes care about.
  Open it with each variant selected (boya Gray / Purple / Candle Light,
  dark and light) and skim top to bottom. Every scope below has at least
  one token that should be colored.
-->

# boya — syntax token preview

A *quick* **brown** `fox` jumps over the ~~lazy~~ dog. [link](https://example.com)
> Block quote line with `inline code` and *emphasis*.

## Markdown features

- Unordered list with `inline` and **bold**
- Another item with `code`, *italic*, and a [link](https://example.com)

1. Ordered list
2. With `code` and **bold**

```ts
// TypeScript block — comments, strings, numbers, keywords, types, decorators
import { readFile } from 'node:fs/promises';

/**
 * JSDoc comment with a {@link Target} reference and a <Tag>.
 */
export interface Options {
  /** input path */
  path: string;
  retries?: number;
  tags: ReadonlyArray<string>;
}

export const DEFAULT: Options = Object.freeze({
  path: '/tmp/data.json',
  retries: 3,
  tags: ['alpha', 'beta'],
});

export async function load(opts: Options = DEFAULT): Promise<unknown> {
  const buf = await readFile(opts.path, 'utf8'); // utf-8 BOM handled below
  return JSON.parse(buf) as unknown;
}

class Greeter<T extends string> {
  constructor(public readonly name: T) {}
  greet(): string {
    return `Hello, ${this.name}!`;
  }
}

new Greeter('world').greet();
```

```js
// JavaScript block
const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
const result = [1, 2, 3, 4, 5]
  .map((x) => x * x)
  .filter((x) => x > 5)
  .reduce((a, b) => a + b, 0);
console.log('result =', result);

function* range(start, end) {
  for (let i = start; i < end; i++) yield i;
}
for (const n of range(0, 5)) {
  if (n % 2 === 0) console.log('even', n);
}
```

```py
# Python block — decorators, type hints, f-strings, comprehensions
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Iterable

@dataclass(frozen=True)
class Point:
    x: float
    y: float
    tags: list[str] = field(default_factory=list)

    def distance(self, other: Point) -> float:
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5


def primes(limit: int) -> Iterable[int]:
    return (n for n in range(2, limit) if all(n % d for d in range(2, n)))


if __name__ == "__main__":
    for p in primes(20):
        print(f"prime: {p}")
```

```rb
# Ruby block
module Greeter
  class Formal
    def initialize(name)
      @name = name
    end

    def hello
      "Hello, #{@name.upcase}!"
    end
  end
end

puts Greeter::Formal.new('world').hello

# Symbols, hash keys, ranges
opts = { host: 'localhost', port: 3000, secure: true }
(1..10).each { |i| puts i * i }
```

```css
/* CSS block — selectors, properties, values, units, pseudo-classes */
:root {
  --brand: oklch(0.62 0.18 264);
  --bg: oklch(0.18 0.02 270);
}

.card > .title + .body {
  color: var(--brand);
  background: var(--bg);
  border: 1px solid oklch(0.5 0.05 270 / 0.4);
  padding: 0.5rem 1rem;
  margin: 0 auto;
  transition: transform 200ms ease-in-out;
}

.card:hover .title {
  transform: translateY(-2px);
}

@media (prefers-color-scheme: dark) {
  .card { background: oklch(0.12 0.02 270); }
}
```

```html
<!-- HTML block -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>boya preview</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body class="dark">
    <main id="app" data-theme="purple">
      <h1 class="title">Hello, <span>world</span>!</h1>
      <p class="lead">A short paragraph with <em>emphasis</em>.</p>
      <button type="button" aria-pressed="false">Click me</button>
    </main>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

```json
{
  "$schema": "https://json.schemastore.org/package.json",
  "name": "boya-sample",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "node ../scripts/oklch-shift.js",
    "preview": "code . --reuse-window"
  },
  "dependencies": {
    "@types/node": "^20.0.0"
  }
}
```

```go
// Go block
package main

import (
	"context"
	"fmt"
	"time"
)

type Counter struct {
	value int
}

func (c *Counter) Inc() { c.value++ }

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	ch := make(chan string, 4)
	go func() {
		defer close(ch)
		for i := 0; i < 4; i++ {
			ch <- fmt.Sprintf("tick %d", i)
		}
	}()

	for msg := range ch {
		fmt.Println("got:", msg)
		if ctx.Err() != nil {
			return
		}
	}
}
```

```cpp
// C++ block — preprocessor, templates, namespaces, primitives
#include <iostream>
#include <vector>
#include <string>

namespace boya {

template <typename T>
class Stack {
public:
    void push(T value) { data_.push_back(std::move(value)); }
    T pop() {
        T v = std::move(data_.back());
        data_.pop_back();
        return v;
    }
    std::size_t size() const noexcept { return data_.size(); }

private:
    std::vector<T> data_;
};

}  // namespace boya

int main(int argc, char** argv) {
    boya::Stack<std::string> s;
    for (int i = 1; i < argc; ++i) s.push(argv[i]);
    while (s.size() > 0) std::cout << s.pop() << "\n";
    return 0;
}
```

## Token buckets to check

- Comments: `// line`, `/* block */`, `# shebang`, `<!-- -->`
- Strings: `"double"`, `'single'`, `` `template` ``
- Numbers: `42`, `0xFF`, `3.14`, `1_000`
- Keywords: `if/else`, `return`, `class`, `import`, `def`, `module`, `package`
- Storage types: `const`, `let`, `var`, `static`, `pub`, `async`
- Functions: `load()`, `Greeter()`, `primes()`
- Classes / types: `Options`, `Greeter<T>`, `Counter`
- Constants / booleans: `true`, `false`, `null`, `nil`, `None`
- Operators: `+`, `===`, `?:`, `|>`, `=>`, `**`, `<<`
- Tags / attributes (HTML/JSX): `<main>`, `<button>`, `class=`, `data-theme`
- Markdown: emphasis, bold, links, code spans, lists
- Regex / escapes inside strings: `\n`, `ÿ`, `\$`
- Decorators: `@dataclass`, `@Component`
- Punctuation: commas in arg lists, brackets, braces

If a bucket above doesn't look right in the active boya variant, that's a
regression in the OKLCH shift — bump `syntaxChromaScale` in `scripts/oklch-shift.js`
or add a more specific scope rule in the source theme JSON.