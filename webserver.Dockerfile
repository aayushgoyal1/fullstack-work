FROM node:11

WORKDIR /code

# One thing to realize is that docker caches layers.
# Reinstalling dependencies takes a while, so that's why we do it first.
# Ideally, you want to install the deps that change least often first

# First, install root dependencies (only 1 at time of writing, shouldn't change much)
COPY ./package.json /code/package.json
COPY ./package-lock.json /code/package-lock.json
RUN npm ci --only=production

# Next, install the frontend's dependencies (they change a little more often, and take a long time to install)
COPY ./frontend/package.json /code/frontend/package.json
COPY ./frontend/package-lock.json /code/frontend/package-lock.json
RUN npm ci --prefix frontend --only=production

# Finally, install the backend's dependencies (you don't want to wait on the frontend unless you have to)
COPY ./backend/package.json /code/backend/package.json
COPY ./backend/package-lock.json /code/backend/package-lock.json
RUN npm ci --prefix backend --only=production

# Finally, copy the code and build the frontend
COPY . /code
RUN npm run --prefix frontend build

# It's all ready! Expose the HTTP port and start the backend server up!
EXPOSE 80
CMD ["npm", "start"]
