module.exports = (returnThis = null) => {
  global.mongo = {
    ObjectID() {
      return returnThis;
    },
    collections() {
      return {
        async findOne() {
          return returnThis;
        },
        async find() {
          return returnThis;
        },
        async insertOne() {
          return returnThis;
        },
        async insertMany() {
          return returnThis;
        },
        async updateOne() {
          return returnThis;
        },
        async updateMany() {
          return returnThis;
        },
        async deleteOne() {
          return returnThis;
        },
        async deleteMany() {
          return returnThis;
        }
      };
    }
  };
};
