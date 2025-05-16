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
    // console.log('EXIF Data:', tags); // 调试时可以取消注释

    if (tags.ccv3?.value) {
      try {
        const decoded = Base64.decode(tags.ccv3.value);
        const decodedData = JSON.parse(decoded);
        // console.log('Decoded ccv3:', decodedData); // 调试时可以取消注释
        return decodedData;
      } catch (error) {
        console.error('解析或解码 ccv3 元数据失败:', error);
        return null;
      }
    } else {
      // console.log('在 EXIF 数据中未找到 ccv3 标签。'); // 无需作为错误提示，可能图片就是没有
      return null;
    }
  } catch (error) {
    console.error('读取图片文件或加载 EXIF 数据失败:', error);
    return null;
  }
};