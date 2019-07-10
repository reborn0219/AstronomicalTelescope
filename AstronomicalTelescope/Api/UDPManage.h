//
//  UDPManage.h
//  AstronomicalTelescope
//
//  Created by apple on 2019/6/1.
//  Copyright © 2019 yang. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "GCDAsyncUdpSocket.h"

NS_ASSUME_NONNULL_BEGIN
@protocol UDPServerSocketDelegate <NSObject>

- (void)serverSocketDidReceiveMessage:(NSString *)message;

@end
@interface UDPManage : NSObject
@property (nonatomic, weak)id <UDPServerSocketDelegate>delegate;

@property (nonatomic, strong)GCDAsyncUdpSocket * udpSocket;

@property (nonatomic, copy)NSString * clientIP;
@property (nonatomic, assign)uint16_t clientPort;
@property (nonatomic, assign)BOOL isSending;
@property (nonatomic, strong)NSMutableArray * messageQueue;
@property (nonatomic, copy)NSString * currentSendingMessage;
@property (nonatomic,assign)NSInteger times;
@property (nonatomic,assign)NSInteger resendTimes;

- (void)startListenClientSocketMessage;
- (void)stopListen;
- (void)sendMessage:(NSString *)message;
@end

NS_ASSUME_NONNULL_END
