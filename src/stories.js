import React from 'react'
import { StyleSheet, View, Dimensions, Animated, StatusBar } from 'react-native'
import { observer } from 'mobx-react/native'
import Story from './story'
import store from './store'

const { width, height } = Dimensions.get('window')

export default class extends React.Component {
  componentDidMount() {
    StatusBar.setHidden(true)
  }

  render() {
    const { panResponder, stories, swipedHorizontally, horizontalSwipe, verticalSwipe, deckIdx, onNextItem, pause, dismissCarousel, currentDeck, onPrevItem, setBackOpacity, backOpacity, indicatorAnim } = this.props
    return (
      <View style={styles.container} {...panResponder.panHandlers}>
        {stories.map((story, idx) => {
          let scale = verticalSwipe.interpolate({
            inputRange: [-1, 0, height],
            outputRange: [1, 1, 0.75]
          })

          if (swipedHorizontally) {
            scale = horizontalSwipe.interpolate({
              inputRange: [width * (idx - 1), width * idx, width * (idx + 1)],
              outputRange: [0.79, 1, 0.78]
            })
          }

          return (
            <Animated.View
              key={idx}
              style={[styles.deck, {
                transform: [
                  {
                    translateX: horizontalSwipe.interpolate({
                      inputRange: [width * (idx - 1), width * idx, width * (idx + 1)],
                      outputRange: [width, 0, -width]
                    })
                  },
                  {
                    translateY: verticalSwipe.interpolate({
                      inputRange: [-1, 0, height],
                      outputRange: [0, 0, height / 2]
                    })
                  },
                  { scale }
                ]
              }]
              }>
              <Story
                story={story}
                currentDeck={deckIdx == idx}
                onNextItem={onNextItem}
                pause={pause}
                onPrevItem={onPrevItem}
                dismissCarousel={dismissCarousel}
                setBackOpacity={setBackOpacity}
                backOpacity={backOpacity}
                indicatorAnim={indicatorAnim}
              />
            </Animated.View>
          )
        })}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)'
  },
  deck: {
    position: 'absolute',
    width, height,
    top: 0, left: 0
  }
})
