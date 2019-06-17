//
//  MessageBoxVC.m
//  AstronomicalTelescope
//
//  Created by 刘帅 on 2019/6/18.
//  Copyright © 2019 yang. All rights reserved.
//

#import "MessageBoxVC.h"

@interface MessageBoxVC ()
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
    // Do any additional setup after loading the view from its nib.
}
- (IBAction)confirmBtnAction:(id)sender {
    [self dismissViewControllerAnimated:YES completion:nil];
}
- (IBAction)cancelBtnAction:(id)sender {
    [self dismissViewControllerAnimated:YES completion:nil];

}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
