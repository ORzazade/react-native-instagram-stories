import React, { Component } from 'react'
import { StyleSheet, View, Dimensions, TouchableWithoutFeedback, UIManager, Platform } from 'react-native'
import { observer } from 'mobx-react/native'
import Stories from './stories'
import store from './store'
import  InstagramStories from './instagramStories'
import Bubbles from './bubbles'

const { width, height } = Dimensions.get('window')

@observer
export default class extends Component {
  componentWillMount() {
    if (Platform.OS == 'android') { UIManager.setLayoutAnimationEnabledExperimental(true) }
  }

  render() {
    return (
      <InstagramStories/>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  carouselWrap: {
    overflow: 'hidden',
    position: 'absolute'
  },
  closed: {
    width: 0,
    height: 0
  },
  open: {
    width, height,
    top: 0,
    left: 0
  },

  btn: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    backgroundColor: 'black'
  }
})
