//
//  USTimes.m
//  TimeHomeApp
//
//  Created by us on 16/4/13.
//  Copyright © 2016年 石家庄优思交通智能科技有限公司. All rights reserved.
//

#import "PhoneInterface.h"


@implementation PhoneInterface

- (void)scan{
    [self.webVC scan];
}
- (void)ready{
    [self.webVC ready];
}
-(void)showview{
    [self.webVC showview];

}
-(void)dialog:(NSString*)title :(NSString*)content :(NSString*)flag :(NSString*)buttons :(NSString*)callid{
    
    [self.webVC dialog:title :content :flag :buttons :callid];

}
@end
