class RTConsumer {
  // Real Time Consumer
  constructor(client, cookieId, consumer_name) {
    this.client = client;
    // assuming multiple consumer handling done by external logic
    this.consumer_name = consumer_name;
    // assuming group already exsits
    this.group = "analytics:" + cookieId;
    this.stream = "stream:" + cookieId;
    this.cpm = "CPM:" + cookieId;
    // set current bucket
    this.bucket = "bucket:" + cookieId;
    // set minute pointer
    this.current_minute = "currentMinute:" + cookieId;
  }
  // Check Pending List
  async getPending() {
    const result = await this.client.xReadGroup(
      this.group,
      this.consumer_name,
      {
        key: this.stream,
        id: "0",
      },
      {
        Count: 5,
      },
      // implement blocking
    );
    if (result.length == 0) return false;
    else return result;
  }
  // Consume the Unconsumed list
  async readUnConsumed() {
    return await this.client.xReadGroup(
      this.group,
      this.consumer_name,
      {
        key: this.stream,
        id: ">",
      },
      {
        Count: 5,
      },
    );
  }
  async getBucket() {
    const res1 = await this.client.get(this.bucket);
    if (res1) return res1;
    else {
      await this.setBucket(true);
      return "0";
    }
  }
  async setBucket(reset = false) {
    if (reset) {
      await this.client.set(this.bucket, "0");
    } else {
      await this.client.incr(this.bucket);
    }
  }
  async getMinute() {
    const res1 = await this.client.get(this.current_minute);
    if (res1) return res1;
    else {
      await this.setMinute(0);
      return 0;
    }
  }
  async setMinute(minute) {
    await this.client.set(this.current_minute, String(minute));
  }
  async updateBucket(minute) {
    // Add the Bucket to Stream
    const body = {
      minute: await this.getMinute(),
      clicks: await this.getBucket(),
    };
    await this.client.xAdd(this.cpm, "*", body);
    console.log("Updated Analytics: ", body);
    // reset bucket and set current minute
    await this.setBucket(true);
    // INCR
    await this.setBucket();
    await this.setMinute(minute);
  }
  async consume(data) {
    if (!data) return;
    for (const stream of data) {
      for (const element of stream.messages) {
        //console.log(element.message.time);
        const minute = Math.floor(Number(element.message.time) / 60000);
        if (minute == Number(await this.getMinute())) {
          await this.setBucket();
        } else {
          await this.updateBucket(minute);
        }
        await this.client.xAck(this.stream, this.group, element.id);
      }
    }
  }
}

export { RTConsumer };
