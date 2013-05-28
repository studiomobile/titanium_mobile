//
//  TiUITabProxy+SMExt.m
//  Titanium
//
//  Created by Andrey Verbin on 28.05.13.
//
//

#import "TiUITabProxy+SMExt.h"

@interface TiUITabProxy ()
//let compiler know this private method exists
- (void)updateTabBarItem;
@end

@implementation TiUITabProxy (SMExt)

-(void)setTitleTextAttributesNormal:(id)attrs
{
	[self replaceValue:attrs forKey:@"titleTextAttributesNormal" notification:NO];
	[self updateTabBarItem];
}
-(void)setTitleTextAttributesHighlighted:(id)attrs
{
	[self replaceValue:attrs forKey:@"titleTextAttributesHighlighted" notification:NO];
	[self updateTabBarItem];
}
-(void)setTitleTextAttributesDisabled:(id)attrs
{
	[self replaceValue:attrs forKey:@"titleTextAttributesDisabled" notification:NO];
	[self updateTabBarItem];
}
-(void)setTitleTextAttributesSelected:(id)attrs
{
	[self replaceValue:attrs forKey:@"titleTextAttributesSelected" notification:NO];
	[self updateTabBarItem];
}

@end

static NSDictionary* toTitleTextAttributes(NSDictionary* attrs)
{
    if (!attrs || [attrs count] == 0)
    {
        return nil;
    }
    NSMutableDictionary *result = [NSMutableDictionary dictionary];
    id font = [attrs objectForKey:@"font"];
    id color = [attrs objectForKey:@"color"];
    id shadowColor = [attrs objectForKey:@"shadowColor"];
    id shadowOffset = [attrs objectForKey:@"shadowOffset"];
    if (font) {
        [result setObject:[[TiUtils fontValue:font] font] forKey:UITextAttributeFont];
    }
    if (color) {
        [result setObject:[[TiUtils colorValue:color] color] forKey:UITextAttributeTextColor];
    }
    if (shadowColor) {
        [result setObject:[[TiUtils colorValue:shadowColor] color] forKey:UITextAttributeTextShadowColor];
    }
    if (shadowOffset) {
        CGPoint point = [TiUtils pointValue:shadowOffset];
        UIOffset offset = UIOffsetMake(point.x, point.y);
        NSValue *offsetVal = [NSValue value:&offset withObjCType:@encode(UIOffset)];
        [result setObject:offsetVal forKey:UITextAttributeTextShadowOffset];
    }
    return result;
}

void updateTitleTextAttributes(TiUITabProxy *tab, UIBarItem *ourItem) {
    NSDictionary *titleTextAttributesNormal = toTitleTextAttributes([tab valueForKey:@"titleTextAttributesNormal"]);
    if (titleTextAttributesNormal) {
        [ourItem setTitleTextAttributes:titleTextAttributesNormal forState:UIControlStateNormal];
    }
    NSDictionary *titleTextAttributesHighlighted = toTitleTextAttributes([tab valueForKey:@"titleTextAttributesHighlighted"]);
    if (titleTextAttributesHighlighted) {
        [ourItem setTitleTextAttributes:titleTextAttributesHighlighted forState:UIControlStateHighlighted];
    }
    NSDictionary *titleTextAttributesDisabled = toTitleTextAttributes([tab valueForKey:@"titleTextAttributesDisabled"]);
    if (titleTextAttributesDisabled) {
        [ourItem setTitleTextAttributes:titleTextAttributesDisabled forState:UIControlStateDisabled];
    }
    NSDictionary *titleTextAttributesSelected = toTitleTextAttributes([tab valueForKey:@"titleTextAttributesSelected"]);
    if (titleTextAttributesSelected) {
        [ourItem setTitleTextAttributes:titleTextAttributesSelected forState:UIControlStateSelected];
    }
}
