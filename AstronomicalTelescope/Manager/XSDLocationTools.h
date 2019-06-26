//
//  XSDLocationTools.h
//  物联宝管家
//
//  Created by yang on 2019/1/18.
//  Copyright © 2019 wuheGJ. All rights reserved.
//

#import <UIKit/UIKit.h>
NS_ASSUME_NONNULL_BEGIN

@interface XSDLocationTools : UIViewController
+ (XSDLocationTools *)shareInstance;
- (void)startLocationService;
- (void)stopLocationService;

@end

NS_ASSUME_NONNULL_END
