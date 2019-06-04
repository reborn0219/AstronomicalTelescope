//
//  USTimes.m
//  TimeHomeApp
//
//  Created by us on 16/4/13.
//  Copyright © 2016年 石家庄优思交通智能科技有限公司. All rights reserved.
//

#import "USTimes.h"


@implementation USTimes

- (void)scan{
    [self.webVC scan];
}
- (void)ready:(id)param {
    [self.webVC ready];
}


@end
