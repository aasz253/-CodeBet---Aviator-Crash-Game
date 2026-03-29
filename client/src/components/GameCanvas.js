import React, { useRef, useEffect, useCallback } from 'react';

const GameCanvas = ({ multiplier, status }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const curvePointsRef = useRef([]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 20; i++) {
      const x = (width / 20) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    if (status === 'flying' || status === 'crashed') {
      const points = curvePointsRef.current;
      
      if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.8)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      if (points.length > 0) {
        const lastPoint = points[points.length - 1];
        
        ctx.save();
        ctx.translate(lastPoint.x, lastPoint.y);
        
        const angle = points.length > 1 
          ? Math.atan2(
              points[points.length - 1].y - points[points.length - 2].y,
              points[points.length - 1].x - points[points.length - 2].x
            ) - Math.PI / 2
          : -Math.PI / 2;
        ctx.rotate(angle);

        const planeSize = 30;
        
        ctx.beginPath();
        ctx.moveTo(0, -planeSize);
        ctx.bezierCurveTo(
          planeSize * 0.6, -planeSize * 0.3,
          planeSize * 0.6, planeSize * 0.5,
          0, planeSize * 0.3
        );
        ctx.bezierCurveTo(
          -planeSize * 0.6, planeSize * 0.5,
          -planeSize * 0.6, -planeSize * 0.3,
          0, -planeSize
        );
        
        const planeGradient = ctx.createLinearGradient(0, -planeSize, 0, planeSize * 0.5);
        planeGradient.addColorStop(0, '#8b5cf6');
        planeGradient.addColorStop(1, '#6366f1');
        ctx.fillStyle = planeGradient;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, -planeSize * 0.2);
        ctx.lineTo(-planeSize * 0.3, planeSize * 0.1);
        ctx.lineTo(0, planeSize * 0.1);
        ctx.lineTo(planeSize * 0.3, planeSize * 0.1);
        ctx.closePath();
        ctx.fillStyle = '#a78bfa';
        ctx.fill();

        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        if (status === 'flying') {
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(lastPoint.x, lastPoint.y + planeSize * 0.5 + 10, 5, 0, Math.PI * 2);
          ctx.fill();
          
          const particleCount = 3;
          for (let i = 0; i < particleCount; i++) {
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = Math.random() * 15 + 5;
            const alpha = Math.random() * 0.5 + 0.2;
            
            ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.beginPath();
            ctx.arc(lastPoint.x + offsetX, lastPoint.y + planeSize * 0.5 + offsetY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    } else {
      const centerX = width * 0.15;
      const startY = height * 0.8;
      
      ctx.save();
      ctx.translate(centerX, startY);
      
      const planeSize = 25;
      ctx.beginPath();
      ctx.moveTo(0, -planeSize);
      ctx.bezierCurveTo(
        planeSize * 0.6, -planeSize * 0.3,
        planeSize * 0.6, planeSize * 0.5,
        0, planeSize * 0.3
      );
      ctx.bezierCurveTo(
        -planeSize * 0.6, planeSize * 0.5,
        -planeSize * 0.6, -planeSize * 0.3,
        0, -planeSize
      );
      
      ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.font = '16px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('Place your bet!', width / 2, height / 2 + 100);
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 400;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (status === 'flying') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = canvas.width;
      const height = canvas.height;

      const minMultiplier = 1;
      const maxMultiplier = Math.min(multiplier, 100);
      const normalizedX = Math.min((multiplier - minMultiplier) / (maxMultiplier - minMultiplier), 1);
      
      const x = width * 0.1 + (width * 0.8) * normalizedX;
      const baseY = height * 0.85;
      const maxHeight = height * 0.1;
      const y = baseY - (maxHeight * Math.min(normalizedX, 1));

      curvePointsRef.current.push({ x, y });

      if (curvePointsRef.current.length > 100) {
        curvePointsRef.current.shift();
      }
    } else if (status === 'waiting') {
      curvePointsRef.current = [];
    }
  }, [multiplier, status]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[400px] rounded-xl bg-dark-900"
      style={{ display: 'block' }}
    />
  );
};

export default GameCanvas;
