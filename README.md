## The arrangement

Here I’m trying to come up with a way to put together a whole system, frontend and backend, in a way that makes it understandable and maintainable.

The app logic — and the code — is structured around **scenarios**, user workflow scenarios like these: registration, log in, email confirmation, password reset, etc.

Scenarios have some UI elements and some backend elements. Scenarios have a definition of input and the definition of possible outcomes: usually one of successful, and multiple error states.

I’m trying to make use of the TypeScript’s type‑system so that it first guides, and then ties together the UI code and the backend code.

I have described some of the details [here][1], [here][2], and [here][3].

[1]: https://gurdiga.com/blog/2020/01/31/simpler-architecture/
[2]: https://gurdiga.com/blog/2020/02/14/simpler-architecture-specifics/
[3]: https://gurdiga.com/blog/2020/03/16/simpler-architecture-validation-and-error-handling/

## LICENCE

```
MIT License

Copyright (c) 2019 Vlad GURDIGA

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
