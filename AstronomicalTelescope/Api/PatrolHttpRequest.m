//
//  PatrolHttpRequest.m
//  物联宝管家
//
//  Created by yang on 2019/3/30.
//  Copyright © 2019 wuheGJ. All rights reserved.
//

#import "PatrolHttpRequest.h"

@implementation PatrolHttpRequest

#pragma mark - 公共接口
+(void)checkEquipment:(id)obj :(CommandCompleteBlock)block{
    
    [BaseRequest getRequestData:@"checkEquipment" parameters:obj :^(id  _Nullable data, ResultCode resultCode, NSError * _Nullable Error) {
        
        block(data,resultCode,Error);
        
    }];
}
+(void)checkcaptain:(id)obj :(CommandCompleteBlock)block{
    
    [BaseRequest getRequestData:@"checkcaptain" parameters:obj :^(id  _Nullable data, ResultCode resultCode, NSError * _Nullable Error) {
        
        block(data,resultCode,Error);
        
    }];
}
+(void)getcommunitybylatlng:(id)obj :(CommandCompleteBlock)block{
    [BaseRequest getRequestData:@"getcommunitybylatlng" parameters:obj :^(id  _Nullable data, ResultCode resultCode, NSError * _Nullable Error) {
        
        block(data,resultCode,Error);
        
    }];
}


@end
