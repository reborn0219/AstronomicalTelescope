//
//  PatrolHttpRequest.h
//  物联宝管家
//
//  Created by yang on 2019/3/30.
//  Copyright © 2019 wuheGJ. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "BaseRequest.h"

NS_ASSUME_NONNULL_BEGIN

@interface PatrolHttpRequest : NSObject


//-------------------------------------------------公共接口

+(void)checkEquipment:(id)obj :(CommandCompleteBlock)block;

+(void)checkcaptain:(id)obj :(CommandCompleteBlock)block;

+(void)getcommunitybylatlng:(id)obj :(CommandCompleteBlock)block;

@end

NS_ASSUME_NONNULL_END
