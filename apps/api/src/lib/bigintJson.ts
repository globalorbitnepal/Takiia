const proto = Object.getPrototypeOf(1n) as { toJSON?: () => string };
if (typeof proto.toJSON !== 'function') {
  proto.toJSON = function toJSON(this: bigint) {
    return this.toString();
  };
}
