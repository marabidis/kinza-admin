export default () => ({
  async send({ to, text }: { to: string; text: string }) {
    console.log(`SMS to ${to}: ${text}`);
  },
});
