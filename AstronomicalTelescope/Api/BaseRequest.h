//
//  BaseRequest.h
//  物联宝管家
//
//  Created by yang on 2019/3/30.
//  Copyright © 2019 wuheGJ. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface BaseRequest : NSObject

/**
 GET请求

 @param url 接口地址
 @param obj 接口参数
 @param block 请求回调
 */
+(void)getRequestData:(NSString *)url parameters:(id)obj :(CommandCompleteBlock)block;
/**
 POST请求
 
 @param url 接口地址
 @param obj 接口参数
 @param block 请求回调
 */
+(void)postRequestData:(NSString *)url parameters:(id)obj :(CommandCompleteBlock)block;


/**
 多媒体上传接口

 @param url 接口地址
 @param obj 拓展参数
 @param fileURL 文件路径
 @param videoImgData 视频缩略图
 @param fileName 文件名称
 @param imgDataArr 图片数组
 @param type 类型 0 图片上传 1 语音上传 2 视频上传
 @param block 回调
 */
+(void)postRequestData:(NSString *)url parameters:(id)obj dataUrl:(NSURL*)fileURL fileName:(NSString *)fileName imgData:(NSData *)imgData fileType:(NSInteger)type :(CommandCompleteBlock)block;

@end

NS_ASSUME_NONNULL_END
