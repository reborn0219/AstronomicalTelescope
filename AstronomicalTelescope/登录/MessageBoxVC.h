//
//  MessageBoxVC.h
//  AstronomicalTelescope
//
//  Created by 刘帅 on 2019/6/18.
//  Copyright © 2019 yang. All rights reserved.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface MessageBoxVC : UIViewController
@property(nonatomic,strong)AlertBlock block;
-(void)showInVC:(UIViewController *)VC Type:(NSInteger)type;
-(void)showInVC:(UIViewController *)VC dialog:(NSString*)title :(NSString*)content :(NSString*)flag :(NSString*)buttons :(NSString*)callid;

@end

NS_ASSUME_NONNULL_END
