const Subscription = require("egg").Subscription;

class DeleteTransportedFiles extends Subscription {
  static get schedule() {
    return {
      cron: "0 0 */1 * * *",
      type: "all",
    };
  }

  async subscribe() {
    const { ctx } = this;
    await ctx.service.content.delTransportedFiles();
    console.log("delete transported files");
  }
}

module.exports = DeleteTransportedFiles;
