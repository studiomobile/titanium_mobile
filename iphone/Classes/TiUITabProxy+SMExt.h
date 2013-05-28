//
//  TiUITabProxy+SMExt.h
//  Titanium
//
//  Created by Andrey Verbin on 28.05.13.
//
//

#import "TiUITabProxy.h"

@interface TiUITabProxy (SMExt)
-(void)setTitleTextAttributesNormal:(id)attrs;
-(void)setTitleTextAttributesHighlighted:(id)attrs;
-(void)setTitleTextAttributesDisabled:(id)attrs;
-(void)setTitleTextAttributesSelected:(id)attrs;
@end

void updateTitleTextAttributes(TiUITabProxy *tab, UIBarItem *item);