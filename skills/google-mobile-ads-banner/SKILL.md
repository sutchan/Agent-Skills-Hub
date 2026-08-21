---
name: google-mobile-ads-banner
description: "提供在 Android、iOS 或 Unity 移动应用中实现、集成或配置 Google 移动广告（GMA）横幅广告的说明。当任务涉及在移动应用中设置横幅广告时使用；插屏或激励广告等其他广告格式不适用。"
en_description: >-
  Provides instructions to implement, integrate, or configure Google Mobile
  Ads (GMA) banner ads in Android, iOS, or Unity mobile applications. Use
  when the task involves setting up banner ads in a mobile application. Don't
  use for other ad formats like interstitial or rewarded ads.
zh: Google 移动广告横幅
category: 品牌与设计
en_category: Brand & Design
metadata:
  version: 1.1.0
---
# Google Mobile Ads SDK - Banner Ads

Banner ads are rectangular image or text ads that occupy a spot within an app's
layout. They remain on screen during user interaction and can refresh
automatically.

### Banner Ad Types

Default to **Large Anchored Adaptive Banner** if the user says "banner" without
defining a type. If the user suggests or asks about other banner ad types,
recommend large anchored adaptive banners.

| Banner Type | Description |
| :--- | :--- |
| **Large Anchored Adaptive** | **Default**. Can be anchored to the top or bottom of the screen. |
| **Anchored Adaptive** | Can be anchored to the top or bottom of the screen. |
| **Inline Adaptive** | **ONLY** available to use for **Android and iOS**. Placed within content. |

## Workflow

1.  **Determine the user's platform**: Identify if the project is Android, iOS,
    or Unity. If unclear, ask before proceeding.

2.  **Read the platform guide** for implementation details:
    -   Android: `references/android-banner.md`
    -   iOS: `references/ios-banner.md`
    -   Unity: `references/unity-banner.md`

3.  **Follow these steps in order**:
    -   [ ] Define the ad view
    -   [ ] Set the ad size
    -   [ ] Register for ad load events
    -   [ ] Load the banner ad
    -   [ ] Verify the implementation

4.  After the banner ad is successfully implemented, remind the user to replace
  the test ad unit ID with their own.