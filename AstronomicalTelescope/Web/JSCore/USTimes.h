//
//  USTimes.h
//  TimeHomeApp
//
//  Created by us on 16/4/13.
//  Copyright © 2016年 石家庄优思交通智能科技有限公司. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <JavaScriptCore/JavaScriptCore.h>
#import "WebViewVC.h"

@protocol  JSPortocol <JSExport>

-(void)scan;
-(void)ready:(id)param;

@end

@interface USTimes : NSObject<JSPortocol>

@property(nonatomic,retain)WebViewVC *webVC;

-(void)scan;
-(void)ready:(id)param;

@end
