import ExifReader from 'exifreader';
import { Base64 } from 'js-base64';

/**
 * 从图片文件中提取并解码 ccv3 元数据。
 * @param file 图片文件对象
 * @returns 返回解码后的 ccv3 数据 (JSON 对象)，如果失败则返回 null。
 */
export const extractAndDecodeCcv3 = async (file: File): Promise<any | null> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const tags = ExifReader.load(arrayBuffer);
    console.log('EXIF Data:', tags); // 保留日志以便调试

    if (tags.ccv3?.value) {
      try {
        const decoded = Base64.decode(tags.ccv3.value);
        const decodedData = JSON.parse(decoded);
        console.log('Decoded ccv3:', decodedData); // 保留日志以便调试
        return decodedData;
      } catch (error) {
        console.error('Failed to decode ccv3:', error);
        // 可以选择抛出错误或返回 null/特定错误对象
        return null;
      }
    } else {
      console.log('No ccv3 tag found.');
      return null; // 没有找到 ccv3 标签
    }
  } catch (error) {
    console.error('Failed to read file or load EXIF data:', error);
    return null; // 读取文件或 EXIF 数据失败
  }
};
