//
//  WebViewVC.h
//  TimeHomeApp
//
//  Created by us on 16/1/26.
//  Copyright © 2016年 石家庄优思交通智能科技有限公司. All rights reserved.
//
/**
 用于加载网页显示
 **/

#import <JavaScriptCore/JavaScriptCore.h>


@interface WebViewVC : UIViewController<UIWebViewDelegate>

@property(nonatomic,strong) JSContext *context;
@property(nonatomic,copy)NSString *ipName;
-(NSDictionary *)getGPS;
-(void)gohome;

-(void)scan;
-(void)ready;
-(void)showview;
-(void)dialog:(NSString*)title :(NSString*)content :(NSString*)flag :(NSString*)buttons :(NSString*)callid;

@end
