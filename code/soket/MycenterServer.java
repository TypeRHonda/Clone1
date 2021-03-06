package socket.centerServer;

import java.io.DataOutputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.text.SimpleDateFormat;
import java.util.Date;



public class MyCenterServer {
	
	static String getTime(){
		SimpleDateFormat f = new SimpleDateFormat("[hh:mm:ss]");
		return f.format(new Date());
	}
		
	public static void main(String[] args) throws Exception {
		
		int countByte = 0;
		String serverIp = null;
		ServerSocket serverSocket = null;
		try{
			serverSocket = new ServerSocket(8888);	// 서버소켓 생성 후, 8888번 포트에 바인드
			System.out.println("server : 서버가 준비되었습니다. " + getTime());
			System.out.println(serverSocket);
			
		}catch(IOException ie){
			ie.printStackTrace();
		}
		
		while(true){
			try{
				System.out.println("server : 연결 요청을 기다립니다.... " + getTime());
			
				Socket socket = serverSocket.accept();	// 클라이언트 소켓통신 수락
				System.out.println(socket);
				System.out.println("server : " +getTime() + " " + socket.getInetAddress() + 
						"로부터 연결요청이 들어왔습니다.");
			
				InputStream in = socket.getInputStream();	// 클라이언트의 데이터를 읽어들일 InputStream 생성
				OutputStream out = socket.getOutputStream();
				
				// 클라이언트로부터 서버타입을 읽어서 타입 지정
				byte[] serverType = new byte[10];
				in.read(serverType); 
				String type = new String(serverType).trim();
				System.out.println("server : "+ type + "번 서버를 선택했습니다.");
			
				// 클라이언트로부터 파일이름을 읽어서 파일이름 지정
				byte[] filenameArr = new byte[50];	
				in.read(filenameArr);	
				String filename = new String(filenameArr).trim();
				System.out.println("server : 파일이름을 " + filename + "으로 지정했습니다.");
				
				FileOutputStream fileOut = new FileOutputStream("C:\\Download\\"+filename);	// 클라이언트 데이터를 받을 InputStream 생성
		
				System.out.println("server : 클라이언트로부터 데이터를 가져옵니다.");
				
		
				
				while(true){	// 클라이언트로부터 데이터를 읽는다.
					int data = in.read();
					fileOut.write(data);
					countByte++;
					
					if(data == -1){
						break;
					}
				}
				
				// 이부분때문에 4시간을 보냈지만......실패하였습니다.....
				//
				//
	////////////////////////////////////////////////////////////////////////////////////
			
//				String response = "총 " + countByte + "바이트를 전송받았습니다.";
//				
//				DataOutputStream dos = new DataOutputStream(out);
//				
//				dos.writeUTF(response);
//		
////////////////////////////////////////////////////////////////////////////////////	
				
				System.out.println("CenterServer : 연결을 종료합니다.");
				
				fileOut.close();
				in.close();
				out.close();
				socket.close();
				
				
				
				if(type.equals("1")){
					serverIp = "192.168.0.40";			
				}
				else if(type.equals("2")){
					serverIp = "192.168.0.59";
				}
				else if(type.equals("3")){
					serverIp = "192.168.0.8";
				}
				
				System.out.println("CenterServer : 지방서버에 연결을 시도합니다.......");
				
				socket = new Socket(serverIp, 7777);
				
				System.out.println("CenterServer : 지방서버에 연결되었습니다");
				System.out.println(socket);
			
				OutputStream out1 = socket.getOutputStream();	// 서버에 데이터를 보내기 위한 OutputStram 생성
				
				out1.write(filenameArr);		// 서버에 파일이름 전송
				
				FileInputStream fileInput = new FileInputStream("C:\\Download\\"+filename);
				
				System.out.println("CenterServer : 지방서버에 파일을 전송합니다.");
				while(true){	// 서버에 전송하기 위한 파일을 읽어서 서버로 보낸다.
				
					int data = fileInput.read();
					
					out1.write(data);
				
					if(data == -1){
						break;
					}
				}
				
				System.out.println("CenterServer : 파일 전송을 완료했습니다.");
				out.flush();
				fileInput.close();
				socket.close();
				
			}catch(IOException e){
				e.printStackTrace();
			}
		}
	}
}
	
		
	


