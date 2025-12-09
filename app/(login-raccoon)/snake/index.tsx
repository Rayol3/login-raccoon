import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/presentation/theme/components/ThemedText';

const BOARD_SIZE = 20;
const CELL_SIZE = Dimensions.get('window').width / BOARD_SIZE;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const SPEED = 100;

enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT,
}

const SnakeGame = () => {
    const router = useRouter();
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState(INITIAL_FOOD);
    const [direction, setDirection] = useState(Direction.RIGHT);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isPlaying && !isGameOver) {
            intervalRef.current = setInterval(moveSnake, SPEED);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying, isGameOver, snake, direction]);

    const moveSnake = () => {
        const head = { ...snake[0] };

        switch (direction) {
            case Direction.UP:
                head.y -= 1;
                break;
            case Direction.DOWN:
                head.y += 1;
                break;
            case Direction.LEFT:
                head.x -= 1;
                break;
            case Direction.RIGHT:
                head.x += 1;
                break;
        }

        if (checkCollision(head)) {
            gameOver();
            return;
        }

        const newSnake = [head, ...snake];

        if (head.x === food.x && head.y === food.y) {
            setScore(score + 1);
            generateFood();
        } else {
            newSnake.pop();
        }

        setSnake(newSnake);
    };

    const checkCollision = (head: { x: number; y: number }) => {
        // Wall collision
        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
            return true;
        }
        // Self collision
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        return false;
    };

    const generateFood = () => {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * BOARD_SIZE),
                y: Math.floor(Math.random() * BOARD_SIZE),
            };
            let collision = false;
            for (const segment of snake) {
                if (segment.x === newFood.x && segment.y === newFood.y) {
                    collision = true;
                    break;
                }
            }
            if (!collision) break;
        }
        setFood(newFood);
    };

    const gameOver = () => {
        setIsGameOver(true);
        setIsPlaying(false);
        Alert.alert('Game Over', `Score: ${score}`, [
            { text: 'Restart', onPress: resetGame },
            { text: 'Exit', onPress: () => router.back() },
        ]);
    };

    const resetGame = () => {
        setSnake(INITIAL_SNAKE);
        setFood(INITIAL_FOOD);
        setDirection(Direction.RIGHT);
        setScore(0);
        setIsGameOver(false);
        setIsPlaying(true);
    };

    const handleDirection = (newDirection: Direction) => {
        if (
            (direction === Direction.UP && newDirection === Direction.DOWN) ||
            (direction === Direction.DOWN && newDirection === Direction.UP) ||
            (direction === Direction.LEFT && newDirection === Direction.RIGHT) ||
            (direction === Direction.RIGHT && newDirection === Direction.LEFT)
        ) {
            return;
        }
        setDirection(newDirection);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <ThemedText style={styles.score}>Score: {score}</ThemedText>
            </View>

            <View style={styles.board}>
                {snake.map((segment, index) => (
                    <View
                        key={index}
                        style={[
                            styles.cell,
                            styles.snake,
                            {
                                left: segment.x * CELL_SIZE,
                                top: segment.y * CELL_SIZE,
                                width: CELL_SIZE,
                                height: CELL_SIZE,
                            },
                        ]}
                    />
                ))}
                <View
                    style={[
                        styles.cell,
                        styles.food,
                        {
                            left: food.x * CELL_SIZE,
                            top: food.y * CELL_SIZE,
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                        },
                    ]}
                />
            </View>

            <View style={styles.controls}>
                <TouchableOpacity style={styles.controlButton} onPress={() => handleDirection(Direction.UP)}>
                    <Ionicons name="chevron-up" size={30} color="white" />
                </TouchableOpacity>
                <View style={styles.horizontalControls}>
                    <TouchableOpacity style={styles.controlButton} onPress={() => handleDirection(Direction.LEFT)}>
                        <Ionicons name="chevron-back" size={30} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.controlButton, styles.playButton]}
                        onPress={() => (isPlaying ? setIsPlaying(false) : setIsPlaying(true))}
                    >
                        <Ionicons name={isPlaying ? 'pause' : 'play'} size={30} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton} onPress={() => handleDirection(Direction.RIGHT)}>
                        <Ionicons name="chevron-forward" size={30} color="white" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.controlButton} onPress={() => handleDirection(Direction.DOWN)}>
                    <Ionicons name="chevron-down" size={30} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        padding: 10,
    },
    score: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    board: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        position: 'relative',
    },
    cell: {
        position: 'absolute',
        borderRadius: 2,
    },
    snake: {
        backgroundColor: '#2E7D32',
    },
    food: {
        backgroundColor: '#FF5722',
        borderRadius: 50,
    },
    controls: {
        marginTop: 30,
        alignItems: 'center',
    },
    horizontalControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    controlButton: {
        backgroundColor: '#333',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    playButton: {
        backgroundColor: '#2E7D32',
    },
});

export default SnakeGame;
