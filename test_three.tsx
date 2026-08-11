import React, { useRef, useEffect } from "react";
import Globe from "react-globe.gl";
import * as THREE from 'three';

export const TestGlobe = () => {
    const globeRef = useRef<any>();
    
    useEffect(() => {
        if (!globeRef.current) return;
        
        // Let's add a custom mesh to the globe scene
        const scene = globeRef.current.scene();
        
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 1000; i++) {
           vertices.push(Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100);
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: 0x888888, size: 2 });
        const mesh = new THREE.Points(geometry, material);
        scene.add(mesh);
        
        let req;
        const animate = () => {
            mesh.rotation.y += 0.01;
            req = requestAnimationFrame(animate);
        }
        animate();
        
        return () => {
            cancelAnimationFrame(req);
            scene.remove(mesh);
        }
    }, [])

    return <Globe ref={globeRef} globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg" />
}
