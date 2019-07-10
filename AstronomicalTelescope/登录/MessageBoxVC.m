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
    [self assignmentWithJS];
    
}
-(void)assignmentWithJS{
    
//    按键返回值：
//    MessageBox.BUTTON_CLOSE=0;                //直接关闭
//    MessageBox.BUTTON_OK=1;                    //确定
//    MessageBox.BUTTON_CANCLE=2;                //取消
//    MessageBox.BUTTON_YES=3;                //是
//    MessageBox.BUTTON_NO=4;                    //否
//    MessageBox.BUTTON_RETRY=5;                //重试
//    MessageBox.BUTTON_ABORT=6;                //终止
//    MessageBox.BUTTON_IGNORE=7;                //忽略
    if(_buttons.integerValue == 0){
        //确定
    }else if(_buttons.integerValue == 1){
        //确定  取消
    }else if(_buttons.integerValue == 2){
        //停止、重试、忽略

    }else if(_buttons.integerValue == 3){
        //是 否 取消

    }else if(_buttons.integerValue == 4){
        //是 否

    }else if(_buttons.integerValue == 5){
        //重试、取消
    }
    
    if([_flag isEqualToString:@"MESSAGE"]){
        //消息，无任何标志
        [self.errorImageV setImage:[UIImage imageNamed:@""]];

    }else if([_flag isEqualToString:@"WARNING"]){
        //警告标志
        [self.errorImageV setImage:[UIImage imageNamed:@"停止警告"]];
    }else if([_flag isEqualToString:@"ERROR"]){
        //错误标志
        [self.errorImageV setImage:[UIImage imageNamed:@"失败"]];

    }else if([_flag isEqualToString:@"QUERY"]){
        //询问标志
        [self.errorImageV setImage:[UIImage imageNamed:@"query_icon"]];

    }else if([_flag isEqualToString:@"INFORMATION"]){
        //消息标志
        [self.errorImageV setImage:[UIImage imageNamed:@"information_icon"]];

    }
    
    
    
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
