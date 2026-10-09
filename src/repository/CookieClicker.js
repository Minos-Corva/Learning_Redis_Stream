class CookieClicker {
  constructor(client) {
    this.client = client;
  }
  async click(cookieId) {
    const currentTime = new Date().getTime();
    if ((await this.client.xLen("stream:" + cookieId)) == 0) {
      await this.client.set(cookieId, currentTime.toString());
    }
    const startTime = Number(await this.client.get(cookieId));
    const delta = currentTime - startTime;
    this.client.xAdd("stream:" + cookieId,"*",{
      event: "click",
      time: delta.toString(),
    });
  }
  async readall(cookieId) {
    return await this.client.xRange("stream:" + cookieId, "-", "+");
  }
}

export { CookieClicker };