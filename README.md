# Silvia

Our mission is to create high performance dashboards inside of your browser.

## Getting started.

### If you are on a mac and don't have node installed.
First thing to do is to install nvm
```
brew uninstall --ignore-dependencies node 
brew uninstall --force node 
brew update 
brew install nvm 
mkdir ~/.nvm 
vim ~/.bash_profile 
```

COPY AND PASTE these two lines into your terminal text editor.
```
export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh
```

Next to save the script press
```
ESC + :wq 

```

Then copy and paste this command into your terminal
```
source ~/.bash_profile
```

### Getting githubcli up and running
```
brew install gh

```

## Running the package
```
nvm install node 
nvm install 18
gh repo clone tc-cole/silvia ./silvia
cd ./silvia
npm update
npm run dev

```
