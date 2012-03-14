#!/bin/bash


base=$PWD
src=_site/
deploy=_deploy/

## todo have it passed as env variables
remote=$DPLOY_REMOTE_URL
branch=$DPLOY_REMOTE_BRANCH

[ -z $remote ] && echo "Required DPLOY_REMOTE_URL unset" && exit 1
[ -z $branch ] && echo "Required DPLOY_REMOTE_BRANCH unset" && exit 1

# copy _site to the _deploy git repo
[ -d _deploy ] || mkdir $deploy || exit 1
cp -r $src/* $deploy || exit 1

# init the git repo, if needed
cd $deploy
[ -d .git ] || git init || exit 1

# setup remote origin
echo "Adding remote origin $remote"
git remote add origin $remote || echo origin already setup

# add everything and commit
git add .
git commit && echo "Changes commited to \"$deploy\", now pushing to $remote -> $branch" && git push $remote master:$branch || exit 0



