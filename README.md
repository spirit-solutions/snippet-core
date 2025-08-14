# Snippet Service

## 1. Local Development

### 1.1 Prerequisites

- [bun](https://bun.com)
- [Docker](https://docker.com)

### 1.2 Commands

```sh
cd snippet-service
bun i

# Development Server
bun dev
```

## 2. Testing

Unit & integration Tests are written under single describe block with name (either `unit` or `integration`) so they can be targeted separetely in the CI.

```ts
describe.only("unit", () => {
  describe("Snippet Controller", () => {
    test("test", () => {
      expect(true).toBe(true);
    });
  });
});

describe.only("integration", () => {
  describe("Snippet Controller", () => {
    test("test", () => {
      expect(true).toBe(true);
    });
  });
});
```
