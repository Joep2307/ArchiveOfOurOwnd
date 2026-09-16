# To-dos

Every to-do is one file in this folder. The status is part of the
file name:

- `TODO 1 (Not done yet).md` — nobody has started it
- `TODO 1 (Doing).md` — someone is working on it
- `TODO 1 (Done).md` — finished

Numbers go up and are never reused. The first line of the file is the
title (`# ...`), the rest is the details.

## Commands

```sh
pnpm todo list                       # show all to-dos
pnpm todo add "Title" "Details"      # new to-do, gets the next number
pnpm todo doing 3                    # TODO 3 -> (Doing)
pnpm todo done 3                     # TODO 3 -> (Done)
pnpm todo open 3                     # TODO 3 -> (Not done yet)
```

You can also add or rename the files by hand, as long as the name
stays `TODO <number> (<status>).md`.
