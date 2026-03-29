import React, { useRef, useEffect, useCallback, useState } from 'react';

const GameCanvas = ({ multiplier, status, crashPoint }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const wingPhaseRef = useRef(0);
  const positionRef = useRef({ x: 0, y: 0 });
  const multiplierRef = useRef(multiplier);
  const statusRef = useRef(status);
  const crashPointRef = useRef(crashPoint);

  useEffect(() => {
    multiplierRef.current = multiplier;
    statusRef.current = status;
    crashPointRef.current = crashPoint;
  }, [multiplier, status, crashPoint]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const multiplier = multiplierRef.current;
    const status = statusRef.current;
    const crashPoint = crashPointRef.current;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)';
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

    if (status === 'waiting') {
      const startX = width * 0.1;
      const startY = height * 0.85;
      
      ctx.save();
      ctx.translate(startX, startY);
      
      drawPlane(ctx, 0, 30);
      
      ctx.restore();

      ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
      ctx.font = '18px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('Place your bet!', width / 2, height / 2 + 100);
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    const maxMultiplier = crashPoint || Math.max(multiplier * 1.2, 5);
    const displayProgress = crashPoint ? Math.min(multiplier / crashPoint, 1) : Math.min(multiplier / maxMultiplier, 1);
    
    console.log('Drawing plane - multiplier:', multiplier, 'crashPoint:', crashPoint, 'progress:', displayProgress);
    
    const startX = width * 0.05;
    const startY = height * 0.88;
    const endX = width * 0.95;
    const endY = height * 0.15;
    
    const currentX = startX + (endX - startX) * displayProgress;
    
    let currentY;
    if (displayProgress < 0.3) {
      const phaseProgress = displayProgress / 0.3;
      currentY = startY - (startY - height * 0.5) * phaseProgress;
    } else if (displayProgress < 0.7) {
      const phaseProgress = (displayProgress - 0.3) / 0.4;
      currentY = height * 0.5 - (height * 0.5 - height * 0.25) * phaseProgress;
    } else {
      const phaseProgress = (displayProgress - 0.7) / 0.3;
      currentY = height * 0.25 - (height * 0.25 - endY) * phaseProgress;
    }

    positionRef.current = { x: currentX, y: currentY };
    
    drawTrail(ctx, startX, startY, currentX, currentY, width);

    ctx.save();
    ctx.translate(currentX, currentY);
    
    const angle = (endX - startX) !== 0 
      ? Math.atan2(endY - startY, endX - startX) + Math.PI / 2
      : -Math.PI / 2;
    ctx.rotate(angle);
    
    const status = statusRef.current;
    const wingSpeed = status === 'crashed' ? 0 : 0.15;
    wingPhaseRef.current += wingSpeed;
    const wingOffset = Math.sin(wingPhaseRef.current) * 8;
    
    drawPlaneWithWings(ctx, wingOffset, status === 'crashed');
    
    ctx.restore();

    if (status === 'flying') {
      drawEngineParticles(ctx, currentX, currentY, angle);
    }

    animationRef.current = requestAnimationFrame(draw);
  }, []);

  const drawPlane = (ctx, wingOffset, isCrashed) => {
    const planeSize = 30;
    
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    ctx.moveTo(0, -planeSize + wingOffset * 0.3);
    ctx.quadraticCurveTo(planeSize * 0.5, -planeSize * 0.2 + wingOffset, planeSize * 0.3, planeSize * 0.2);
    ctx.quadraticCurveTo(planeSize * 0.2, planeSize * 0.3, 0, planeSize * 0.3);
    ctx.quadraticCurveTo(-planeSize * 0.2, planeSize * 0.3, -planeSize * 0.3, planeSize * 0.2);
    ctx.quadraticCurveTo(-planeSize * 0.5, -planeSize * 0.2 - wingOffset, 0, -planeSize - wingOffset * 0.3);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = isCrashed ? '#ef4444' : '#16a34a';
    ctx.beginPath();
    ctx.ellipse(0, planeSize * 0.4, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPlaneWithWings = (ctx, wingOffset, isCrashed) => {
    const planeSize = 35;
    
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 20;
    
    ctx.beginPath();
    ctx.moveTo(0, -planeSize);
    ctx.quadraticCurveTo(planeSize * 0.3, -planeSize * 0.5 + wingOffset * 0.5, planeSize * 0.8, -planeSize * 0.2 + wingOffset);
    ctx.lineTo(planeSize * 0.5, planeSize * 0.1);
    ctx.lineTo(planeSize * 0.3, planeSize * 0.3);
    ctx.lineTo(0, planeSize * 0.2);
    ctx.lineTo(-planeSize * 0.3, planeSize * 0.3);
    ctx.lineTo(-planeSize * 0.5, planeSize * 0.1);
    ctx.lineTo(-planeSize * 0.8, -planeSize * 0.2 - wingOffset);
    ctx.quadraticCurveTo(-planeSize * 0.3, -planeSize * 0.5 - wingOffset * 0.5, 0, -planeSize);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(0, -planeSize * 0.6);
    ctx.lineTo(planeSize * 0.6, -planeSize * 0.3 + wingOffset);
    ctx.lineTo(0, -planeSize * 0.3);
    ctx.lineTo(-planeSize * 0.6, -planeSize * 0.3 - wingOffset);
    ctx.closePath();
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = isCrashed ? '#ef4444' : '#16a34a';
    ctx.beginPath();
    ctx.ellipse(0, planeSize * 0.35, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawTrail = (ctx, startX, startY, currentX, currentY, width) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    const controlX1 = startX + (currentX - startX) * 0.3;
    const controlY1 = startY * 0.7;
    const controlX2 = startX + (currentX - startX) * 0.7;
    const controlY2 = currentY * 1.3;
    
    ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, currentX, currentY);
    
    const gradient = ctx.createLinearGradient(startX, 0, currentX, 0);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.1)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.8)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const drawEngineParticles = (ctx, x, y, angle) => {
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = Math.random() * 25 + 15;
      const alpha = Math.random() * 0.7 + 0.2;
      const size = Math.random() * 4 + 1;
      
      ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  };

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
      className="w-full h-[400px] rounded-xl"
      style={{ 
        display: 'block',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)',
        border: '1px solid rgba(34, 197, 94, 0.3)'
      }}
    />
  );
};

export default GameCanvas;
