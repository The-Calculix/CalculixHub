## CalculixHub
# How to run

Install Git and Set up Git into your Mac/PC
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git version
git config --list
cd path/to/your/project
git init
```

Create a github account and set up github account

```bash
Go to github and create a new branch in the repo - call it whatever you want
```

Then, run this command in the terminal
```bash
git fetch
git switch <branch-name-that-you-have-created>
```

```bash
git clone "https://github.com/The-Calculix/CalculixHub.git"
npm install
npm run dev
```
Output:
```bash
> react-example@0.0.0 dev
> tsx server.ts

◇ injected env (0) from .env // tip: ⌘ suppress logs { quiet: true }
[Calculix Hub] Server running at http://localhost:8000
```

Then, click on the link: http://localhost:8000
