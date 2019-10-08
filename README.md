# UTD NEC [![CI status of master branch](https://travis-ci.com/jamescostian/nec.svg?token=hMKYL2so9Aa8djzCER8i&branch=master)](https://travis-ci.com/jamescostian/nec)

## Getting Started

You'll need [Node.js](https://nodejs.org/) (version 11+), [MongoDB](https://www.mongodb.com/), [Docker](https://www.docker.com/get-started), and [git-lfs](https://git-lfs.github.com/).

Once you've installed Node and cloned this repo, `cd` into it, run `npm install` to install the dependencies, run `git lfs install --force` to install LFS to for large files, and then run `git lfs pull`.

Run `npm run develop` to bring up the frontend and backend in development mode - each of them will restart if you change their files. Note that `npm run develop` does not run the ML library! Look further in the README for documentation on how to get that set up

## Structure

### Backend

The backend is an [Express](http://expressjs.com) server in `backend` and most of it's the API in `backend/api`. The `server.js` file is what starts up the server with all of the API routes. `backend/package.json` lists dependencies for the backend, and has scripts like `start` and `test` for the backend only.

In development (`npm run develop`), it listens to port 46601 and restarts automatically when you change a `backend` file. To run in production, set the environment variable `NODE_ENV` to `production`.

### Frontend

The frontend is in `frontend` and most of it is CSS and JSX in `frontend/src`. Static resources that don't need any processing (like images) are in `frontend/public`. `frontend/package.json` lists dependencies for the frontend, and has scripts like `start` and `test` defined by Create React App that are for the frontend only.

See [Create React App](https://facebook.github.io/create-react-app/) for more info. Note that if you try to connect to this server from another device (e.g. using something like `192.168.1.23:3000`) _it won't work_. Instead, you'll need to use `npm run build && npm start`, which will run both the backend and frontend on a single server on port 46601 (but it doesn't support automatic reloading!)

### ML

The Machine Learning code is in `ML_library` and you can run it in a container on your machine by `cd`ing into the directory where you cloned this, and running:

```
docker build -f ml-without-cuda.Dockerfile -t necml . && docker run --rm -it -e "MONGODB_HOST=host.docker.internal" -p 5678:5678 -v `pwd`/uploads:/uploads necml
```

If you have CUDA, you can change the `ml-without-cuda.Docker` to `ml.Dockerfile` in the above line. Also, if you think it's stuck at `Executing transaction: ...working...`, then don't worry - it isn't printing it's progress, but it really is working. Give it some more time! It takes a LONG time to run the first time (and every time you change `environment.yaml` in the `ML_library` directory). This is because it's installing/reinstalling ALL of those things in `environment.yaml`, which takes a while. If you change the code but not `environment.yaml`, it will not reinstall things, which dramatically speeds things up.

## Tests

Use `npm test` to run all tests for the backend, and then all tests for the frontend. If you `cd frontend && npm test` then you'll only run the frontend tests, and if you `cd backend && npm test` then you'll only run the backend tests.

Unit tests should be near whatever they're testing, and should end in `.test.js`. Integration tests belong in a `tests` directory.

Use `npm run coverage` to see the test coverage.

## Configuring

Configuration is done in `config.json` for the most part, however some configuration settings _must_ be available to the frontend. Things in `frontend/src/config.js` are visible to the frontend and backend, while things in `config.json` are **only** visible to the backend.

### Changing the graphs

If you'd like to change the graphs, have a look at `frontend/src/views/VideoDetail.js` to see how the report page is laid out, as well as `frontend/src/components/TimeSlice.js` to control how the bar graph is made, and `frontend/src/components/PieChart.js` to see how the Pie Chart is made, and `backend/api/report.js` to see how the MongoDB documents are passed to the frontend. If you want to change what's stored in the DB, look at `ML_Library/predictor.py`

If you plan on using several different models or changing how they work, you need to use a different `featureID` (which goes in `config.json`). Each different `featureID` should have a different set of labels and colors (can be written in RGB or HEX like for CSS colors, e.g. `rgb(18, 8, 214)` or `#1208d6`) that will be shown to users in reports.

If you want to change how data is aggregated, see the last function in `backend/api/report.js`

## Production

To emulate production on your local machine, you first need to run `docker network create nec`. After that, every time you want to run production, you only have to run this: `docker-compose build && docker-compose run --publish 80:80 web`

There are 2 steps to that command:

1. Build all the containers
2. Run the web container (and everything it depends on), while publishing it to port 80

### Server Setup

I set up a VM using Ubuntu Server 18.04, but newer versions of Ubuntu should work fine. You may need some extra work for Debian to work, and there will be several changes for CentOS and others, but anything running the Linux kernel should work. [Install Docker](https://docs.docker.com/install/linux/docker-ce/ubuntu/) first, then install [CUDA for docker](https://marmelab.com/blog/2018/03/21/using-nvidia-gpu-within-docker-container.html) (you need to change `xenial` and `16.04` to the codename and version of Ubuntu you're using - use `lsb_release -a` to find out what you installed). Next, [install git-lfs](https://github.com/git-lfs/git-lfs/wiki/Installation) and then run this:

```
sudo curl -L "https://github.com/docker/compose/releases/download/1.23.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo mkdir /acme
sudo docker network create nec
sudo docker run -d --restart always --name traefik -v /var/run/docker.sock:/var/run/docker.sock -v /acme:/acme -p 443:443/tcp -p 80:80/tcp --expose 443/tcp --expose 80/tcp --entrypoint "/traefik" traefik:latest -c /dev/null --docker --docker.watch --acme --acme.email="ans180000@utdallas.edu" --acme.storage=/acme/acme.json --acme.httpchallenge.entrypoint=http --acme.entrypoint=https --acme.onhostrule=true --accesslogsfile=/acme/access.log --entryPoints="Name:https Address::443 TLS Compress:on" --entryPoints="Name:http Address::80 Redirect.EntryPoint:https Compress:on" --defaultEntryPoints="https,http"
sudo docker network connect nec traefik
```

Next, [add a deployment key for this repo](https://gist.github.com/zhujunsan/a0becf82ade50ed06115) - make sure you generate the key on the server you're deploying to! You'll also need to clone this repo on that server to a folder called `repo`, and then getting the server up and running is as simple as `cd`ing into it and running `docker-compose up -d`

When you push new commits to master and want to run them on the server, make sure you `cd` into the directory with the code and then just run `git pull && docker-compose build && docker-compose down && docker-compose up -d`.

Note that you _will need_ to have an SSL certificate, so continue to the next section. You will also need to follow the instructions in the Service Provider section if you want users to log in with the normal UTD login page

#### SSL Certificates

If you keep the domain registed via Porkbun, you can use [this page](https://porkbun.com/account/ssl/utdnec.app) to get a new SSL certificate that lasts for 90 days (after which, you need to repeat this process!). Download the zip file and unzip it.

If you can't get Let's Encrypt certificates from Porkbun, then look into getting Let's Encrypt certificates manually through DNS challenges. Perhaps certbot can help?

Anyway, once you have the certificate files, you'll need to use them to update `/acme/acme.json` on the server. If that file doesn't exist, create it and put this in it:

```
{
  "Account": {
    "Email": "ans180000@utdallas.edu",
    "Registration": {
      "body": {
        "status": "valid",
        "contact": [
          "mailto:ans180000@utdallas.edu"
        ]
      },
      "uri": "https://acme-v02.api.letsencrypt.org/acme/acct/51977392"
    },
    "PrivateKey": "REPLACE THIS WITH THE RESULT OF RUNNING cat private.key.pem | sed '1d;$d' | tr -d '\n'",
    "KeyType": "4096"
  },
  "Certificates": [
    {
      "Domain": {
        "Main": "utdnec.app",
        "SANs": null
      },
      "Certificate": "REPLACE THIS WITH THE RESULT OF RUNNING cat domain.cert.pem | base64 -w 0",
      "Key": "REPLACE THIS WITH THE RESULT OF RUNNING cat private.key.pem | base64 -w 0"
    }
  ],
  "HTTPChallenges": {},
  "TLSChallenges": null
}
```

As you can see in the above template, there is a `PrivateKey` that says to use `cat private.key.pem | sed '1d;$d' | tr -d '\n'` in its place. You should do that if you used Porkbun, otherwise look for the private key and use its path instead of `private.key.pem`. Also notice that `Certificate` and `Key` give you commands to use as well - run them too, and of course, change the path as needed.

If you run everything correctly, you'll see `MII` at the beginning of the thing you put in `PrivateKey`, and you'll see `LS0t` at the beginning of the thing you put in `Certificate` and you'll also see `LS0t` in the beginning of the thing you put in `Key`.

If you get an error, it may be because you are using BSD tools (like the ones that come with macOS) instead of GNU ones. If that's the case, run those commands on a Linux machine, because Linux distros come with GNU utilities.

#### Service Provider

If you want a dummy login page, you have nothing to worry about. But if you want the login page to actually interface with the SAML authentication that normal UTD apps use, then you need the private key for encrypting and the private key for signing. They need to be placed in `idp-keys/encrypt/key.pem` and `idp-keys/sign/key.pem`. If you are given these keys, **do not check them in to git**. They are _private_ keys that should not be shared with anyone, and ideally should only stay on the servers on which the system is deployed.

If the private keys are shared with someone you don't trust, you should change them. Email identityprovider@utdallas.edu and ask them for help. To regenerate keys, use this:

```
openssl req -x509 -newkey rsa:4096 -keyout idp-keys/encrypt/key.pem -out idp-keys/encrypt/cert.pem -days 365
openssl req -x509 -newkey rsa:4096 -keyout idp-keys/sign/key.pem -out idp-keys/sign/cert.pem -days 365
```

### Direct Access to Docker Containers

On production, you can directly access MongoDB by running `sudo docker run --rm -it --network="repo_nec_internal" mongo mongo mongodb/nec`

If you want to access a container directly, first find it's ID using `docker ps`. For example, if I wanted to access the backend container and I ran `docker ps` and got this:

```
root@utdnecapp:~# docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                      NAMES
6f8138d632c4        repo_web             "npm start"              7 minutes ago       Up 7 minutes        80/tcp                                     repo_web_1
e8bb53aa399c        repo_ml              "/bin/bash -c 'sourc…"   7 minutes ago       Up 7 minutes                                                   repo_ml_1
eab161c3da9a        mongo               "mongod --bind_ip_all"   7 minutes ago       Up 7 minutes        27017/tcp                                  repo_mongodb_1
ee1615b57b28        traefik:latest      "/traefik -c /dev/nu…"   4 days ago          Up 2 days           0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp   traefik
```

Then that would tell me the container's ID is `6f8138d632c4`. Now to access it, I can just run `docker exec -it 6f8138d632c4 /bin/bash` and I'll have a shell within that container.

If you want direct access to a docker volume (e.g. the uploaded files, as well as the frames and audio that are extracted), you can first find the volume's name using `docker volume ls`:

```
DRIVER              VOLUME NAME
local               ce246bfd773ef4778c1d2debe731a819febf6dd06f10ba9fbba54a4fcce42985
local               da3f321005e8f0b7c69b6cfdacc4af4010fc5b47a623427a8a53729bf4212a5d
local               repo_mongodbdata
local               repo_uploads
```

To go to the directory where `repo_uploads` is stored, use `docker volume inspect --format '{{ .Mountpoint }}' repo_uploads`. You can `cd` to that directory, you can `ls`, you can create/rename/move/copy/delete files there. You can even add files through `scp`, for example `scp some_video.mp4 root@utdnec.app:/var/lib/docker/volumes/repo_uploads/_data/videos/some_video.mp4` will copy `some_video.mp4` from your computer to the volume that the containers can access.

If you'd like to move the volumes, you should stop down the containers using them (`docker-compose down`), move the directories, and then create symbolic links to them - there's a guide [here](https://unix.stackexchange.com/a/496393)

#### Deploying

`sudo docker-compose build && sudo docker-compose up -d` will redeploy whatever is in the `repo` folder on the server. Make sure you `cd` into that folder.

### Debugging

`sudo docker-compose build && sudo docker-compose up` will rebuild and redeploy, BUT you will see everything logged in real time, AND when you Ctrl+C to exit, the server will go down. Make sure you run the deploy command above after you finish debugging, or else people can't access the server

### Domain Name Changing

If you want to change the domain name from `utdnec.app` to something else, on a Linux machine (this _DOES NOT_ work on BSDs, including macOS) you can run this to replace `utdnec.app` with `newdomain.com` in your code:

```bash
find . -type f -not -path "./*node_modules/*" -not -path "./*coverage*" -not -path "./.git/*" -not -path "./frontend/public/.*" -not -path "./frontend/build/*" -exec sed -i "s/utdnec.app/newdomain.com/g" {} \;
```

### Subdirectories

If you'd like the website to be accessible from e.g. `https://utdallas.edu/msp/thingy`, then you should go to `frontend/package.json` and add `"homepage" : "https://utdallas.edu/msp/thingy",`

## Reasons For Things

### Why do we need SSL, a domain name, and Let's Encrypt?

If you use an IP address instead of a domain name, you can't get an SSL certificate for it.

If you don't use Let's Encrypt, your SSL certificate will cost money.

If you don't have an SSL certificate, your data will be sent unencrypted. This is fine if it's data sent from your laptop to your laptop during development, but this is _not_ fine if it's videos of a person being sent to a production environment. That person assumes a certain level of security and privacy, and you should give it to them.

If you're thinking "well, I'll just use a self-signed certificate" then stop thinking that! Sure, the connection will be encrypted, but someone could _easily_ MitM you, and users won't even realize it because they will be used to having to accept a self-signed cert.

### Why do we need docker?

1. **Reproduce production locally**. If code works on your laptop, that's great. But how do you know if it will work on the server? Perhaps the server is setup differently than your laptop. With docker containers, you can test your code in a docker container first, and rest easy knowing that it works perfectly before pushing
2. **Fast and identical production setups**. If you manually setup one production server and then later decide you want another, it's normally a long, undocumented, complex process. Two people will not setup the machines the same. You'll have slightly different configurations, need slightly different commands to deploy, etc. But with docker containers, you can simplify the process of setting up a new machine, and ensure that all of your production servers work the exact same way
3. **No undocument dependencies/configurations**. Oftentimes, people will install lots of programs and perform a lot of manual setup. By using docker containers, we ensure that none of the container can access any of those programs or configurations, and as such, undocumented setup instructions won't do anything. If you want to install a program or configure something, it _has_ to be installed/configured via a `Dockerfile`, which means that it _has_ to documented (in that `Dockerfile`), so there will never be a time when someone is like "Wait, why won't this code work?? I thought I installed and configured everything!"
4. **Strict firewall**. If you create a server in a container, it isn't accessible by the real world unless you _explicitly_ tell Docker otherwise. It's easy to create internal networks (e.g. the MongoDB container is accessible to every container within an internal network, but not to the outside world) so that containers can communicate securely and not have to worry about authentication. MongoDB doesn't even have (or need) a password, because nobody can access it unless they're in a container that's in the internal network.

#### Ok, but what about docker-compose?

Docker alone will let you manage a container, but what about when you need several containers to work together? That's when docker-compose comes in. For example, we need there to be a MongoDB container that's accessible only via an internal network. You could just run that command and document it somewhere, or you could keep it in a `docker-compose.yml` file and have it be documented more clearly that way. Also, docker-compose is popular and easy to use and understand.

Kubernetes is _way_ too complex for something this simple, and things like Exoframe are too simplistic.

### Why do we need websockets?

We want to be able to process data _as it comes in_, because that's much more efficient than waiting for the whole file to come in and then processing it.

# Troubleshooting

## Can't find a module

Run `npm install` if this happens in Node. I'm not sure what to do about Python though.

## Can't log in with UTD's IdP

Did the keys expire? Regenerate them! Email identityprovider@utdallas.edu and ask them for help. To regenerate keys, use this:

```
openssl req -x509 -newkey rsa:4096 -keyout idp-keys/encrypt/key.pem -out idp-keys/encrypt/cert.pem -days 3650
openssl req -x509 -newkey rsa:4096 -keyout idp-keys/sign/key.pem -out idp-keys/sign/cert.pem -days 3650
```

## Can't see site because it's untrusted

Your SSL certificates have probably expired. Look for the part of the README that talks about SSL certificates

## It's showing me the wrong log in page!

If you want to see the SAML log in page, you need to have `idp-keys/encrypt/key.pem` and `idp-keys/sign/key.pem`. Those paths can be changed in `config.json`. DO NOT CHECK THOSE FILES INTO GIT!

If you don't want a SAML log in page (e.g. for local work) then rename those files so that the system doesn't find them.
