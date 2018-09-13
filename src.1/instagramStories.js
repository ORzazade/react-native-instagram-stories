import React, { Component } from 'react'
import { LayoutAnimation, Animated, Dimensions, PanResponder } from 'react-native'

export default class InstagramStories extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Bubbles />

        <View style={[
          styles.carouselWrap,
          store.offset,
          (store.carouselOpen ? styles.open : styles.closed)
        ]}>
          <Stories  />
        </View>
      </View>
    )
  }
}