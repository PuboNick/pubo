const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const EncoderMap: Record<string, number> = {};
for (let i = 0; i < 64; i++) {
  EncoderMap[BASE64_CHARS.charAt(i)] = i;
}

/**
 * base64 转Uint8Array
 * @param input base64 字符串
 * @returns Uint8Array
 * base64 6位的二进制, Uint8Array 8位的二进制，整体原理就是将 base64 的每个字符转成2进制然后拼接，再按每个八位为一个单位地取出
 */
export function toUnit8Array(input: string): Uint8Array {
  const output = new Uint8Array((input.length * 6) / 8);
  // 当前二进制字符长度
  let l = 0;
  //  二进制字符缓存值（格式为10进制）
  let b = 0;
  // Uint8Array 的指针
  let j = 0;
  for (let x = 0; x < input.length && j < output.length; x += 1) {
    b = (b << 6) + EncoderMap[input.charAt(x)];
    // 为什么是6？ base64 为64个字符，也就是 2^6，用二进制表示就是6位
    l += 6;
    // 为什么是8？ Uint8Array 是八位的二进制
    if (l >= 8) {
      // 取了前八位后剩余长度
      l -= 8;
      // 前八位的值
      let c = b >>> l;
      output[j++] = c & 0xff;
      // 再将右移的值左移回来，除了前八位不变，后面的皆为0
      c = c << l;
      // 通过减法得到第八位之后的值
      b = b - c;
    }
  }

  return output;
}
