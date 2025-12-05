"""
Script Reading Detection using OpenCV
Detects if applicant is reading from another screen or paper
"""

import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)


def detect_script_reading(video_path):
    """
    Analyze video for script reading patterns using OpenCV face detection
    
    Args:
        video_path: Path to video file
        
    Returns:
        dict: {
            'status': 'clear' | 'suspicious' | 'high_risk',
            'risk_score': int (0-100),
            'data': {...}
        }
    """
    try:
        logger.info(f"Starting script reading detection for: {video_path}")
        
        # Initialize face and eye cascade classifiers (built into OpenCV)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        
        # Open video
        video = cv2.VideoCapture(video_path)
        if not video.isOpened():
            logger.error(f"Could not open video: {video_path}")
            return _default_result("error", "Could not open video file")
        
        # Get video properties
        fps = video.get(cv2.CAP_PROP_FPS)
        total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
        
        logger.info(f"Video properties: {total_frames} frames at {fps} FPS")
        
        # Counters
        processed_frames = 0
        face_detected_frames = 0
        
        # Gaze tracking
        center_frames = 0
        left_frames = 0
        right_frames = 0
        up_frames = 0
        down_frames = 0
        
        # Pattern detection
        horizontal_movements = 0
        vertical_movements = 0
        previous_horizontal_zone = None
        previous_vertical_zone = None
        
        # Sample every 3rd frame for performance (still ~10 FPS analysis)
        frame_skip = 3
        frame_count = 0
        
        while video.isOpened():
            ret, frame = video.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Skip frames for performance
            if frame_count % frame_skip != 0:
                continue
            
            processed_frames += 1
            
            # Convert to grayscale for detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            if len(faces) == 0:
                # No face detected - might be looking away
                continue
            
            face_detected_frames += 1
            
            # Use the largest face (closest to camera)
            faces_sorted = sorted(faces, key=lambda x: x[2] * x[3], reverse=True)
            (x, y, w, h) = faces_sorted[0]
            
            # Define face regions for gaze estimation
            face_center_x = x + w // 2
            face_center_y = y + h // 2
            frame_center_x = frame.shape[1] // 2
            frame_center_y = frame.shape[0] // 2
            
            # Calculate relative position
            # Horizontal zones
            horizontal_offset = face_center_x - frame_center_x
            horizontal_threshold = frame.shape[1] * 0.15  # 15% of frame width
            
            if abs(horizontal_offset) < horizontal_threshold:
                center_frames += 1
                current_h_zone = 'center'
            elif horizontal_offset < 0:
                left_frames += 1
                current_h_zone = 'left'
            else:
                right_frames += 1
                current_h_zone = 'right'
            
            # Vertical zones
            vertical_offset = face_center_y - frame_center_y
            vertical_threshold = frame.shape[0] * 0.15  # 15% of frame height
            
            if abs(vertical_offset) < vertical_threshold:
                current_v_zone = 'center'
            elif vertical_offset < 0:
                up_frames += 1
                current_v_zone = 'up'
            else:
                down_frames += 1
                current_v_zone = 'down'
            
            # Detect horizontal scanning (reading pattern)
            if previous_horizontal_zone and previous_horizontal_zone != current_h_zone:
                if (previous_horizontal_zone == 'left' and current_h_zone == 'right') or \
                   (previous_horizontal_zone == 'right' and current_h_zone == 'left'):
                    horizontal_movements += 1
            
            # Detect vertical scanning
            if previous_vertical_zone and previous_vertical_zone != current_v_zone:
                if (previous_vertical_zone == 'up' and current_v_zone == 'down') or \
                   (previous_vertical_zone == 'down' and current_v_zone == 'up'):
                    vertical_movements += 1
            
            previous_horizontal_zone = current_h_zone
            previous_vertical_zone = current_v_zone
        
        video.release()
        
        logger.info(f"Processed {processed_frames} frames, face detected in {face_detected_frames}")
        
        # Calculate percentages
        if face_detected_frames == 0:
            logger.warning("No faces detected in video")
            return _default_result("error", "No face detected in video")
        
        camera_percent = round((center_frames / face_detected_frames) * 100, 1)
        left_percent = round((left_frames / face_detected_frames) * 100, 1)
        right_percent = round((right_frames / face_detected_frames) * 100, 1)
        up_percent = round((up_frames / face_detected_frames) * 100, 1)
        down_percent = round((down_frames / face_detected_frames) * 100, 1)
        
        # Calculate off-camera percentage
        off_camera_percent = left_percent + right_percent + up_percent + down_percent
        
        # Determine primary off-camera direction
        off_camera_directions = {
            'left': left_percent,
            'right': right_percent,
            'up': up_percent,
            'down': down_percent
        }
        primary_direction = max(off_camera_directions, key=off_camera_directions.get)
        
        # Calculate risk score
        risk_score = 0
        flags = []
        
        # Factor 1: Off-camera time (40% weight)
        if off_camera_percent > 70:
            risk_score += 40
            flags.append(f"Very high off-camera time ({off_camera_percent:.1f}%)")
        elif off_camera_percent > 50:
            risk_score += 30
            flags.append(f"High off-camera time ({off_camera_percent:.1f}%)")
        elif off_camera_percent > 30:
            risk_score += 15
        
        # Factor 2: Consistent direction (30% weight)
        max_direction_percent = off_camera_directions[primary_direction]
        if max_direction_percent > 40:
            risk_score += 30
            flags.append(f"Consistent gaze to {primary_direction} ({max_direction_percent:.1f}%)")
        elif max_direction_percent > 25:
            risk_score += 20
            flags.append(f"Frequent gaze to {primary_direction} ({max_direction_percent:.1f}%)")
        
        # Factor 3: Horizontal scanning (20% weight)
        scanning_frequency = horizontal_movements / (processed_frames / fps) * 60  # per minute
        if scanning_frequency > 15:
            risk_score += 20
            flags.append(f"High horizontal scanning ({int(scanning_frequency)}/min - reading pattern)")
        elif scanning_frequency > 8:
            risk_score += 10
            flags.append(f"Moderate horizontal scanning ({int(scanning_frequency)}/min)")
        
        # Factor 4: Downward gaze (10% weight) - reading from paper
        if down_percent > 30:
            risk_score += 10
            flags.append(f"Frequent downward gaze ({down_percent:.1f}% - possible paper)")
        elif down_percent > 20:
            risk_score += 5
        
        # Determine status
        if risk_score >= 60:
            status = 'high_risk'
        elif risk_score >= 35:
            status = 'suspicious'
        else:
            status = 'clear'
        
        logger.info(f"Detection complete: {status} (risk score: {risk_score})")
        
        return {
            'status': status,
            'risk_score': risk_score,
            'data': {
                'gaze_at_camera_percent': camera_percent,
                'gaze_left_percent': left_percent,
                'gaze_right_percent': right_percent,
                'gaze_up_percent': up_percent,
                'gaze_down_percent': down_percent,
                'horizontal_scanning_count': horizontal_movements,
                'horizontal_scanning_per_minute': round(scanning_frequency, 1),
                'vertical_scanning_count': vertical_movements,
                'primary_off_camera_direction': primary_direction,
                'confidence': _calculate_confidence(face_detected_frames, processed_frames),
                'flags': flags
            }
        }
        
    except Exception as e:
        logger.error(f"Error in script reading detection: {str(e)}", exc_info=True)
        return _default_result("error", str(e))


def _calculate_confidence(face_detected, total_processed):
    """Calculate confidence based on face detection rate"""
    if total_processed == 0:
        return 0
    detection_rate = (face_detected / total_processed) * 100
    if detection_rate >= 80:
        return 90
    elif detection_rate >= 60:
        return 75
    elif detection_rate >= 40:
        return 60
    else:
        return 40


def _default_result(status="clear", message=""):
    """Return default result structure"""
    return {
        'status': status,
        'risk_score': 0,
        'data': {
            'gaze_at_camera_percent': 0,
            'gaze_left_percent': 0,
            'gaze_right_percent': 0,
            'gaze_up_percent': 0,
            'gaze_down_percent': 0,
            'horizontal_scanning_count': 0,
            'horizontal_scanning_per_minute': 0,
            'vertical_scanning_count': 0,
            'primary_off_camera_direction': 'unknown',
            'confidence': 0,
            'flags': [message] if message else []
        }
    }
