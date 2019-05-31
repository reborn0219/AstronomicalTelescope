//
//  BaseRequest.m
//  物联宝管家
//
//  Created by yang on 2019/3/30.
//  Copyright © 2019 wuheGJ. All rights reserved.
//

#import "BaseRequest.h"
#import "AFNetworking.h"

@implementation BaseRequest

+(void)getRequestData:(NSString *)url parameters:(id)obj :(CommandCompleteBlock)block{
    NSLog(@"get 入参:%@",obj);
    NSLog(@"接口地址：%@",url);
    
    AFHTTPSessionManager * httpManger = [[AFHTTPSessionManager alloc]initWithBaseURL:[NSURL URLWithString:Server_Address]];
    
    httpManger.responseSerializer=[AFJSONResponseSerializer serializer];
    [httpManger.requestSerializer willChangeValueForKey:@"timeoutInterval"];
    httpManger.requestSerializer.timeoutInterval = 8.f;
    [httpManger.requestSerializer didChangeValueForKey:@"timeoutInterval"];
    httpManger.requestSerializer=[AFJSONRequestSerializer serializer];
    //    [httpManger.requestSerializer setValue:[UserManager token] forHTTPHeaderField:@"token"];
    
    //    @"test/json",@"test/  javascript",@"text/plain",
    httpManger.responseSerializer.acceptableContentTypes=[NSSet setWithObjects:@"application/json",@"test/json",nil];
    NSDictionary * dic = obj;
    [httpManger GET:@"" parameters:dic progress:^(NSProgress * _Nonnull uploadProgress) {
        
    } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        
    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        
    }];
    
}

+(void)postRequestData:(NSString *)url parameters:(id)obj :(CommandCompleteBlock)block{
    NSLog(@"post 入参:%@",obj);
     NSLog(@"接口地址：%@",url);
    
    
    AFHTTPSessionManager * httpManger = [[AFHTTPSessionManager alloc]initWithBaseURL:[NSURL URLWithString:Server_Address]];

    httpManger.responseSerializer=[AFJSONResponseSerializer serializer];
    [httpManger.requestSerializer willChangeValueForKey:@"timeoutInterval"];
    httpManger.requestSerializer.timeoutInterval = 8.f;
    [httpManger.requestSerializer didChangeValueForKey:@"timeoutInterval"];
    httpManger.requestSerializer=[AFJSONRequestSerializer serializer];
//    [httpManger.requestSerializer setValue:[UserManager token] forHTTPHeaderField:@"token"];

//    @"test/json",@"test/  javascript",@"text/plain",
    httpManger.responseSerializer.acceptableContentTypes=[NSSet setWithObjects:@"application/json",@"test/json",nil];
    NSDictionary * dic = obj;
    [httpManger POST:@"" parameters:dic progress:^(NSProgress * _Nonnull uploadProgress) {
        
    } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        
    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        
    }];
    
}



+(void)postRequestData:(NSString *)url parameters:(id)obj dataUrl:(NSURL*)fileURL fileName:(NSString *)fileName imgData:(NSData *)imgData fileType:(NSInteger)type :(CommandCompleteBlock)block{

    AFHTTPSessionManager * manager = [[AFHTTPSessionManager alloc]initWithBaseURL:[NSURL URLWithString:Server_Address]];

    // AFHTTPResponseSerializer就是正常的HTTP请求响应结果:NSData
    // 当请求的返回数据不是JSON,XML,PList,UIImage之外,使用AFHTTPResponseSerializer
    // 例如返回一个html,text...
    //
    // 实际上就是AFN没有对响应数据做任何处理的情况
    manager.responseSerializer = [AFHTTPResponseSerializer serializer];
    manager.requestSerializer=[AFJSONRequestSerializer serializer];
    manager.responseSerializer.acceptableContentTypes=[NSSet setWithObjects:@"application/json",@"test/json",nil];

//    // formData是遵守了AFMultipartFormData的对象
//    [manager POST:url parameters:@{} constructingBodyWithBlock:^(id<AFMultipartFormData> formData) {
//        // 将本地的文件上传至服务器
//        //        NSURL *fileURL = [[NSBundle mainBundle] URLForResource:@"头像1.png" withExtension:nil];
//
//        NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
//        // 设置时间格式
//        formatter.dateFormat = @"yyyyMMddHHmmss";
//        NSString *str = [formatter stringFromDate:[NSDate date]];
//
//        if (type==0) {
//
//                NSData *data = imgData;
//
//                [formData appendPartWithFileData:data name:@"file" fileName:@"file.jpg" mimeType:@"multipart/form-data"];
//
//        }else if(type ==1){
//
//            //音频
//            if(fileURL != nil) {
//                NSData *data = [NSData dataWithContentsOfURL:fileURL];
//                [formData appendPartWithFileData:data name:@"file" fileName:@".mp3" mimeType:@"multipart/form-data"];
//            }
//        }else{
//            //视频
//            if (fileURL != nil)
//            {
//                NSData *data = [NSData dataWithContentsOfURL:fileURL];
//                [formData appendPartWithFileData:data name:@"file" fileName:[NSString stringWithFormat:@"%@.mp4",str] mimeType:@"multipart/form-data"];
//
//            }
//        }
//
//
//    } success:^(GJAFHTTPRequestOperation *operation, id responseObject) {
////        NSString *result = [[NSString alloc] initWithData:responseObject encoding:NSUTF8StringEncoding];
////        NSLog(@"完成 %@", result);
//        NSError *err;
//        NSDictionary *dic = [NSJSONSerialization JSONObjectWithData:responseObject
//                                                            options:NSJSONReadingMutableContainers
//                                                              error:&err];
//         NSLog(@"完成 %@", dic);
//        [GJSVProgressHUD dismiss];
//
//        if (block) {
//            block(dic,SucceedCode,nil);
//        }
//    }];
    
    
}
@end
