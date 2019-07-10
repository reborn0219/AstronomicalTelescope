//
//  MessageBoxVC.m
//  AstronomicalTelescope
//
//  Created by 刘帅 on 2019/6/18.
//  Copyright © 2019 yang. All rights reserved.
//

#import "MessageBoxVC.h"

@interface MessageBoxVC (){
    NSString *_title;
    NSString *_content;
    NSString *_flag;
    NSString *_buttons;
    NSString *_callid;
    
}
@property (nonatomic,assign) NSInteger type;
@property (weak, nonatomic) IBOutlet UIButton *confirmBtn;
@property (weak, nonatomic) IBOutlet UIButton *cancelBtn;

@property (weak, nonatomic) IBOutlet UIView *backView;

@property (weak, nonatomic) IBOutlet NSLayoutConstraint *leftView_W;
@property (weak, nonatomic) IBOutlet UIView *leftView;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *leftView_H;
@property (weak, nonatomic) IBOutlet UILabel *titleMsg;
@property (weak, nonatomic) IBOutlet UIImageView *errorImageV;
@property (weak, nonatomic) IBOutlet UILabel *contentMsg;

@end

@implementation MessageBoxVC

- (void)viewDidLoad {
    [super viewDidLoad];
    _backView.layer.cornerRadius = 5;
    _confirmBtn.layer.cornerRadius = 5;
    _cancelBtn.layer.cornerRadius = 5;

}
-(void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    _titleMsg.text = _title;
    _contentMsg.text = _content;
    
}
-(void)viewWillDisappear:(BOOL)animated{
    [super viewWillDisappear:animated];
}

- (IBAction)confirmBtnAction:(id)sender {
    [self dismissViewControllerAnimated:YES completion:nil];
    if (_block) {
        _block(1);
    }
}
- (IBAction)cancelBtnAction:(id)sender {
    if (_block) {
        _block(0);
    }
    [self dismissViewControllerAnimated:YES completion:nil];

}
-(void)showInVC:(UIViewController *)VC Type:(NSInteger)type{
   
    _type = type;
    if (self.isBeingPresented) {
        return;
    }
    self.modalTransitionStyle=UIModalTransitionStyleCrossDissolve;
    /**
     *  根据系统版本设置显示样式
     */
    if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0) {
        self.modalPresentationStyle=UIModalPresentationOverFullScreen;
    }else {
        self.modalPresentationStyle=UIModalPresentationCustom;
    }
    [VC presentViewController:self animated:YES completion:nil];
}

-(void)showInVC:(UIViewController *)VC dialog:(NSString*)title :(NSString*)content :(NSString*)flag :(NSString*)buttons :(NSString*)callid{
    _title = title;
    _content = content;
    _flag = flag;
    _buttons = buttons;
    _callid = callid;
    if (self.isBeingPresented) {
        return;
    }
    self.modalTransitionStyle=UIModalTransitionStyleCrossDissolve;
    /**
     *  根据系统版本设置显示样式
     */
    if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0) {
        self.modalPresentationStyle=UIModalPresentationOverFullScreen;
    }else {
        self.modalPresentationStyle=UIModalPresentationCustom;
    }
    [VC presentViewController:self animated:YES completion:nil];
}

@end
