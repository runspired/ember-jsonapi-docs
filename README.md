# Ember JSON API Docs [![Build Status](https://travis-ci.org/ember-learn/ember-jsonapi-docs.svg?branch=master)](https://travis-ci.org/ember-learn/ember-jsonapi-docs)

This tool gets the code comments from `ember.js` and `ember-data` libraries,
turns them into JSON files, and then turns those JSON files into a
[JSON:API](http://jsonapi.org/) format.

The files this tool creates are used to power 
[api.emberjs.com](https://api.emberjs.com).


> ℹ️ **NOTE:** If you are looking for the front end app behind https://api.emberjs.com/, visit [ember-api-docs](https://github.com/ember-learn/ember-api-docs) instead.

## Prerequisites

- the latest [Node.js](https://nodejs.org/) LTS
- [yarn v1](https://yarnpkg.com/)

Clone all of the following repositories into the same directory so they are "siblings" on the file system

- This repository, `ember-jsonapi-docs`
- [ember-api-docs-data](https://github.com/ember-learn/ember-api-docs-data)
- [ember.js](https://github.com/emberjs/ember.js)
- [ember-data](https://github.com/emberjs/data/)

## Generate docs

Decide which version and project you want to build docs for.
Then, in `ember.js` and/or `ember-data` repositories, check out the version
tags you want to generate docs for. For example:

```sh
get fetch --all
git checkout v5.2.0
```

Generate the JSON docs for `ember` and/or `ember-data`. This will add new JSON
files into the `s3-docs` directory of `ember-api-docs-data`:

```sh
yarn
yarn gen --project ember --version "5.2.0"
```

I would recommend committing at this stage so that you can see that the following steps work.

```sh
cd ../ember-api-docs-data/
git add . 
git commit -m "add docs for ember v5.2.0"
```

Next we need to fix the generated files. (Note: this step could probably be incorporated into ember-jsonapi-docs
but for now this step works).

```sh
node ./clean-urls.js
node ./fix-rev-index.js
git add .
git commit -m "fix urls and rev-index for ember"
```

Lastly we need to make sure that each of the new files are valid. You need to run the test suite in `ember-api-docs-data`

```sh
npm i
npm test
```

If you see any errors e.g. `AssertionError: expected '' not to be empty` you need to manually fix these. These are caused by bugs in the yuidoc generation and can probably be fixed in the source files somehow.

Once all of the fixes are in place you can commit them: 

```sh
git add .
git commit -m "fixing tests for ember"
```

--- 

Once that is all committed I would recommend doing the same thing for ember-data with new commits: 

```sh
cd ../ember-jsonapi-docs
yarn gen --project ember-data --version "5.2.0"

cd ../ember-api-docs-data

git add . 
git commit -m "add docs for ember-data v5.2.0"

node ./clean-urls.js
node ./fix-rev-index.js
git add .
git commit -m "fix urls and rev-index for ember-data"

npm test

# if you needed to fix any files you do that now and then
git add .
git commit -m "fixing tests for ember-data"
```

Once that is all done, push it and open a PR 🎉

> ℹ️ **NOTE:** `--version` should match the one in the `package.json` of a target Ember project. If `package.json` uses a release name (e.g. `beta` or `canary`), omit it and use only numbers. For example, if the `package.json` says `3.19.0-beta.2`, use `3.19.0`.

> ✅ **TIP:** If you are debugging failed builds, periodically discard the changes
made to `ember-api-docs-data`, since changes are made in-place.

## (Optional) View the generated docs in a web app

The Prembered version of the ember-api-docs expects a folder in its root that links to the `ember-api-docs-data` folder, so all you need to do is create a symbolic link to ember-api-docs-data and you can see the app running locally.

Clone the [ember-api-docs](https://github.com/ember-learn/ember-api-docs)
repository, install dependencies, and start the front end in "local" mode:

```sh
git clone https://github.com/ember-learn/ember-api-docs
cd ember-api-docs
ln -s ../ember-api-docs-data # assuming it's checked out in the same folder
npm install
yarn start
```

> Note: at the time of writing this the ember-api-docs app needs to be on the `prember` branch but this will change very soon when we go live with it.

Visit the app in your browser at [http://localhost:4200](http://localhost:4200)
